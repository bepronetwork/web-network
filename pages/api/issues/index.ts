import { subHours, subMonths, subWeeks, subYears } from "date-fns";
import models from "db/models";
import { withCors } from 'middleware';
import { NextApiRequest, NextApiResponse } from "next";
import { Op, WhereOptions } from "sequelize";

import paginate from "helpers/paginate";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = { state: { [Op.not]: "pending" } };
  const {
    state,
    issueId,
    repoId,
    time,
    creator,
    address,
    networkName,
    repoPath
  } = req.query || {};

  if (state) whereCondition.state = state;

  if (issueId) whereCondition.issueId = issueId;

  if (repoId) whereCondition.repository_id = repoId;

  if (creator) whereCondition.creatorGithub = creator;

  if (address) whereCondition.creatorAddress = address;

  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    });

    if (!network) return res.status(404).json("Invalid network");
    if (network.isClosed) return res.status(404).json("Invalid network");

    whereCondition.network_id = network.id;
  }

  if (repoPath) {
    const repository = await models.repositories.findOne({
      where: {
        githubPath: repoPath
      }
    });

    if (!repository) return res.status(404).json("Invalid repository");

    whereCondition.repository_id = repository.id;
  }

  if (time) {
    let fn;
    if (time === "week") fn = subWeeks;
    if (time === "month") fn = subMonths;
    if (time === "year") fn = subYears;
    if (time === "hour") fn = subHours;

    if (!fn) return res.status(422).json("Unable to parse date");

    whereCondition.createdAt = { [Op.gt]: fn(+new Date(), 1) };
  }

  const include = [
    { association: "developers" },
    { association: "pullRequests" },
    { association: "mergeProposals" }
  ];

  const issues = await models.issue.findAndCountAll(paginate({ where: whereCondition, include, nest: true }, req.query, [
      [req.query.sortBy || "updatedAt", req.query.order || "DESC"]
  ]));
  // await composeIssues(issues.rows);

  return res.status(200).json(issues);
}

async function SearchIssues(req: NextApiRequest,
                            res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default withCors(SearchIssues)
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {
    ids: [repoId, ghId, networkName]
  } = req.query;
  const issueId = [repoId, ghId].join("/");

  const include = [
    { association: "developers" },
    { association: "pullRequests", where: { status: { [Op.notIn]: ["pending", "canceled"] } }, required: false },
    { association: "mergeProposals" },
    { association: "repository" },
    { association: "token" }
  ];

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!network) return res.status(404).json("Invalid network");

  const issue = await models.issue.findOne({
    where: {
      issueId,
      network_id: network?.id
    },
    include
  });

  console.log("#test", issue);
  console.log("#test", issue.title);

  if (!issue) return res.status(404).json("Issue not found");

  return res.status(200).json(issue);
}

export default async function GetIssues(req: NextApiRequest,
                                        res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

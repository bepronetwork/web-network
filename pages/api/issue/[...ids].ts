import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";
import {LogAccess} from "../../../middleware/log-access";
import WithCors from "../../../middleware/withCors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {
    ids: [repoId, ghId, networkName]
  } = req.query;
  const issueId = [repoId, ghId].join("/");

  const include = [
    { association: "developers" },
    { association: "pullRequests", where: { status: { [Op.notIn]: ["pending", "canceled"] } }, required: false },
    { association: "mergeProposals", include: [{ association: "distributions" }]  },
    { association: "repository" },
    { association: "token" },
    { association: "benefactors" },
    { association: "disputes" }
  ];

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
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

  if (!issue) return res.status(404).json("Issue not found");

  return res.status(200).json(issue);
}

export default LogAccess(WithCors(async function GetIssues(req: NextApiRequest,
                                        res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}))

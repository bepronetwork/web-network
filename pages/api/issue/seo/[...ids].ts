import {NextApiRequest, NextApiResponse} from "next";
import {Op, Sequelize} from "sequelize";

import models from "db/models";

import { IssueRoute } from "middleware/issue-route";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { ids: [repoId, ghId, networkName, chainName] } = req.query;

  const issueId = [repoId, ghId].join("/");

  const chain = await models.chain.findOne({
    where: {
      chainShortName: Sequelize.where(Sequelize.fn("lower", Sequelize.col("chain.chainShortName")), 
                                      chainName?.toString()?.toLowerCase())
    }
  });

  if (!chain) return res.status(404).json("Invalid chain");

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: { [Op.eq]: chain.chainId }
    }
  });

  if (!network) return res.status(404).json("Invalid network");

  const issue = await models.issue.findOne({
    where: {
      issueId,
      network_id: network?.id
    },
    attributes: ["issueId", "title", "body"]
  });

  if (!issue) return res.status(404).json("Issue not found");

  return res.status(200).json(issue);
}

async function IssueSEO(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default IssueRoute(IssueSEO);
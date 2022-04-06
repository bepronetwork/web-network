import models from "db/models";
import {withCors} from 'middleware';
import withJwt from "middleware/withJwt";
import { NextApiRequest, NextApiResponse } from "next";
import { Op, WhereOptions } from "sequelize";

async function getTotal(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = { state: { [Op.not]: "pending" } };
  const {
    state,
    issueId,
    repoId,
    creator,
    address,
    networkName,
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

    whereCondition.network_id = network?.id;
  }

  const issueCount = await models.issue.count({
    where: whereCondition
  });

  return res.status(200).json(issueCount);
}

async function getAll(req: NextApiRequest,
                      res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await getTotal(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default withCors(withJwt(getAll))
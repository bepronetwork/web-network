import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";
import {chainFromHeader} from "../../../helpers/chain-from-header";
import WithCors from "../../../middleware/withCors";
import {WithValidChainId} from "../../../middleware/with-valid-chain-id";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId, networkName]} = req.query;
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

  const chain = await chainFromHeader(req);

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: {[Op.eq]: chain.chainId}
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

export async function handler(req: NextApiRequest,
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

export default WithCors(WithValidChainId(handler));

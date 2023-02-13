import {NextApiHandler} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {
  IM_AM_CREATOR_ISSUE,
  NOT_AN_CREATOR_ISSUE,
  MISSING_CREATOR_ISSUE_SIGNATURE,
  MISSING_CHAIN_ID
} from "helpers/contants";
import decodeMessage from "helpers/decode-message";

export const IssueRoute = (handler: NextApiHandler, methods: string[] = [ `PUT` ]) => {

  return async (req, res) => {
    if (!methods.includes(req.method.toUpperCase()))
      return handler(req, res);

    const {
        ids: [repoId, ghId, networkName],
      } = req.query;

    const headers = req.headers;
    const wallet = (headers.wallet as string)?.toLowerCase();
    const chainId = (headers.chain as string);

    const issueId = [repoId, ghId].join("/");

    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        }
      }
    });
  
    if (!network) return res.status(401).json({message:"Invalid network"});
  
    const issue = await models.issue.findOne({
      where: {
        issueId,
        network_id: network?.id
      },
      include: [{ association: "repository" }]
    });
  
    if (!issue) return res.status(401).json({message: "bounty not found"});

    if (!chainId)
      return res.status(401).json({message: MISSING_CHAIN_ID})

    if (!wallet || wallet.toLowerCase() !== issue?.creatorAddress.toLowerCase())
      return res.status(401).json({message: NOT_AN_CREATOR_ISSUE});

    const signature = headers.signature as string;
    if (!signature)
      return res.status(401).json({message: MISSING_CREATOR_ISSUE_SIGNATURE});

    if (!decodeMessage(chainId, IM_AM_CREATOR_ISSUE, signature, issue?.creatorAddress))
      return res.status(401).json({message: NOT_AN_CREATOR_ISSUE})

    return handler(req, res);
  }
}
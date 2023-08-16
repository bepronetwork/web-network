import {NextApiHandler} from "next";
import {Op} from "sequelize";

import models from "db/models";

import { NOT_AN_CREATOR_ISSUE, MISSING_CHAIN_ID } from "helpers/constants";

import { siweMessageService } from "services/ethereum/siwe";

export const withIssue = (handler: NextApiHandler, methods: string[] = [ `PUT` ]) => {
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
      return res.status(401).json({ message: MISSING_CHAIN_ID });

    if (!wallet || wallet.toLowerCase() !== issue?.creatorAddress.toLowerCase())
      return res.status(401).json({ message: NOT_AN_CREATOR_ISSUE });

    const signature = req.body?.context?.token?.signature;
    const typedMessage = req.body?.context?.typedMessage;
    const issueCreator = issue?.creatorAddress?.toString();

    if (!(await siweMessageService.decodeMessage(typedMessage, signature?.toString(), issueCreator)))
      return res.status(401).json({ message: NOT_AN_CREATOR_ISSUE });

    return handler(req, res);
  }
}
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";
import {isAddress} from "web3-utils";

import Database from "../../../../../db/models";
import {resJsonMessage} from "../../../../../helpers/res-json-message";
import {ErrorMessages} from "../../../../errors/error-messages";

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query?.networkId || (req.query?.address && !isAddress(req.query?.address as string)))
    return resJsonMessage("invalid arguments", res, 400);

  const result = await Database.network.find({
    attributes: ["allow_list"],
    where: {
      ... !req.query?.address ? {allow_list: {[Op.contains]: [req.query?.address]}} : {},
      id: req.query.networkId,
    }
  });

  if (!result)
    return resJsonMessage(ErrorMessages.NoNetworkFoundOrUserNotAllowed, res, 400);

  return res.status(200)
    .json(req.query?.address
      ? {allowed: result.allow_list.includes(req.query?.address)}
      : result.allow_list);
}
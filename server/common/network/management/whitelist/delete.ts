import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";
import {isAddress} from "web3-utils";

import Database from "../../../../../db/models";
import {resJsonMessage} from "../../../../../helpers/res-json-message";
import {ErrorMessages} from "../../../../errors/error-messages";
import {HttpBadRequestError} from "../../../../errors/http-errors";


export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (!req.query?.address || req.query?.networkId || (req.query?.address && !isAddress(req.query.address as string)))
    return resJsonMessage("invalid arguments", res, 400);

  const result = await Database.network.find({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
      allow_list: {
        [Op.contains]: [req.query.address]
      }
    }
  });

  if (!result)
    throw new HttpBadRequestError(ErrorMessages.NoNetworkFoundOrUserNotAllowed)

  const [, updatedAllowList] = await Database.network.update({
    allow_list: [...result.allow_list.splice(1, result.allow_list.findIndex(req.query.address))],
    returning: true,
  })


  return updatedAllowList;
}
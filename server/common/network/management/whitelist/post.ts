import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";
import {isAddress} from "web3-utils";

import Database from "db/models";

import {resJsonMessage} from "../../../../../helpers/res-json-message";
import {ErrorMessages} from "../../../../errors/error-messages";
import {HttpBadRequestError} from "../../../../errors/http-errors";


export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (!req.query?.address || req.query?.networkId || (req.query?.address && !isAddress(req.query.address as string)))
    return resJsonMessage("invalid payload", res, 400);

  const result = await Database.network.find({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
      allow_list: {
        [Op.not]: {
          [Op.contains]: [req.query.address]
        }
      }
    }
  });

  if (!result)
    throw new HttpBadRequestError(ErrorMessages.NoNetworkFoundOrUserAllowed)


  const [, updatedAllowList] = await Database.network.update({
    allow_list: [...result.allow_list, req.query.address],
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
      // no need to exclude from allow_list again
    },
    returning: true,
  });

  return updatedAllowList.allow_list; // an array of the new values
}
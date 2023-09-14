import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";
import {isAddress} from "web3-utils";

import Database from "db/models";
import {ErrorMessages} from "../../../../errors/error-messages";
import {HttpBadRequestError} from "../../../../errors/http-errors";


export default async function (req: NextApiRequest, res: NextApiResponse) {
  const address = !req.query?.address ? "" : typeof req.query.address !== "string" ? req.query.address.join() : req.query.address;
  if (!address || !req.query?.networkId || (address && !isAddress(address as string)))
    throw new HttpBadRequestError(ErrorMessages.InvalidPayload);

  const result = await Database.network.findOne({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
      [Op.not]: [
        {allow_list: {[Op.contains]: [address.toString()]}}
      ]
    }
  });

  if (!result)
    throw new HttpBadRequestError(ErrorMessages.NoNetworkFoundOrUserAllowed)


  const [, updatedAllowList] = await Database.network.update({
    allow_list: [...result.allow_list, address],
  }, {
    where: {
      id: req.query.networkId,
      // no need to exclude from allow_list again
    },
    returning: true,
  });

  return updatedAllowList.allow_list; // an array of the new values
}
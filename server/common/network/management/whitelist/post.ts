import {NextApiRequest, NextApiResponse} from "next";
import {isAddress} from "web3-utils";

import Database from "db/models";
import {ErrorMessages} from "../../../../errors/error-messages";
import {HttpBadRequestError} from "../../../../errors/http-errors";
import {lowerCaseIncludes} from "../../../../../helpers/string";


export default async function (req: NextApiRequest, res: NextApiResponse) {
  const address = !req.query?.address ? "" : typeof req.query.address !== "string" ? req.query.address.join() : req.query.address;
  if (!address || !req.query?.networkId || (address && !isAddress(address as string)))
    throw new HttpBadRequestError(ErrorMessages.InvalidPayload);

  const result = await Database.network.findOne({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
    }
  });

  if (!result || lowerCaseIncludes(address, result?.allow_list || []))
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
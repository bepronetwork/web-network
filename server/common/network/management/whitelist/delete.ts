import {NextApiRequest, NextApiResponse} from "next";
import {isAddress} from "web3-utils";

import Database from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";
import {lowerCaseCompare, lowerCaseIncludes} from "helpers/string";

import {ErrorMessages} from "server/errors/error-messages";
import {HttpBadRequestError} from "server/errors/http-errors";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const address = !req.query?.address ? "" : 
    typeof req.query.address !== "string" ? req.query.address.join() : req.query.address;
  if (!address || !req.query?.networkId || (address && !isAddress(address)))
    throw new HttpBadRequestError(ErrorMessages.InvalidPayload);

  const userAddress = req?.body?.context?.token?.address;

  const result = await Database.network.findOne({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
      creatorAddress: caseInsensitiveEqual("creatorAddress", userAddress)
    }
  });

  if (!result || !lowerCaseIncludes(address, result?.allow_list || []))
    throw new HttpBadRequestError(ErrorMessages.NoNetworkFoundOrUserNotAllowed)

  const [, updatedAllowList] =
    await Database.network
      .update({allow_list: result.allow_list.filter(_a => !lowerCaseCompare(_a, address.toString()))},
        {where: {id: req.query.networkId}, returning: true})


  return updatedAllowList.allow_list;
}
import {NextApiRequest, NextApiResponse} from "next";
import {isAddress} from "web3-utils";

import Database from "../../../../../db/models";
import {toLower} from "../../../../../helpers/string";
import {ErrorMessages} from "../../../../errors/error-messages";
import {HttpBadRequestError} from "../../../../errors/http-errors";

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  const address = !req.query?.address ? "" : typeof req.query.address !== "string" ? req.query.address.join() : req.query.address;
  if (!req.query?.networkId || (address && !isAddress(address)))
    throw new HttpBadRequestError(ErrorMessages.InvalidPayload);

  const result = await Database.network.findOne({
    attributes: ["allow_list"],
    where: {
      id: req.query.networkId,
    }
  });

  if (!result)
    throw new HttpBadRequestError(ErrorMessages.NoNetworkFound)

  return address
    ? {allowed: !result.allow_list.length ? true : result.allow_list.map(toLower).includes(toLower(address))}
    : result.allow_list;
}
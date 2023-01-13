import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";

import Database from "db/models";

import DAO from "services/dao-service";
import {error as LogError} from 'services/logging';
import {isAdmin} from "../../../helpers/is-admin";
import {CHAIN_NOT_CONFIGURED, NOT_AN_ADMIN} from "../../../helpers/contants";
import {chainFromHeader} from "../../../helpers/chain-from-header";
import {resJsonMessage} from "../../../helpers/res-json-message";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {wallet, registryAddress} = req.body;

  if (!isAdmin(req))
    return resJsonMessage(NOT_AN_ADMIN, res, 400);

  try {

    const chain = await chainFromHeader(req);
    const web3Host = chain?.chainRpc;

    const messages = [
      [wallet, 'Missing wallet address'],
      [registryAddress, 'Missing registry address']
    ].filter(([v,]) => v).map(([,message]) => message);

    if (messages.length)
      return resJsonMessage(messages, res, 400);

    if (!web3Host)
      return resJsonMessage(CHAIN_NOT_CONFIGURED, res, 400);

    const dao = new DAO({
      skipWindowAssignment: true,
      web3Host,
      registryAddress
    });

    if (!await dao.start())
      return resJsonMessage("Failed to connect with chain", res, 400);

    const registry = await dao.loadRegistry(true);

    if (!registry)
      return resJsonMessage("Invalid Registry address", res, 400);

    if ((await registry.governed._governor()) !== wallet)
      return resJsonMessage("User must be registry governor", res, 400);

    await Database.settings.create({
      key: "networkRegistry",
      value: registryAddress,
      group: "contracts",
      type: "string",
      visibility: "public"
    });


    return resJsonMessage("Registry saved", res);
  } catch(error) {
    LogError("Failed to save network registry", { error, req });
    return resJsonMessage(error?.message || error?.toString(), res, 500);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;
  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(handler)
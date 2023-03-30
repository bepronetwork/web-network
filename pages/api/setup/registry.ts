import {NextApiRequest, NextApiResponse} from "next";

import Database from "db/models";

import {Settings} from "helpers/settings";

import DAO from "services/dao-service";
import {error as LogError, log as Log, Logger} from 'services/logging';

import {SettingsType} from "types/settings";

import {LogAccess} from "../../../middleware/log-access";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    wallet,
    registryAddress
  } = req.body;

  try {
    if (!wallet || !registryAddress)
      return res.status(400).json("Missing parameters");

    const settings = await Database.settings.findAll({
      where: { visibility: "public" },
      raw: true,
    });

    const publicSettings = (new Settings(settings)).raw() as SettingsType;

    if (publicSettings?.contracts?.networkRegistry)
      return res.status(400).json("Environment already configured");
    if (!publicSettings?.urls?.web3Provider) return res.status(500).json("Missing web3 provider url");
    if (!publicSettings?.defaultNetworkConfig?.adminWallet) return res.status(500).json("Missing admin wallet");

    const { adminWallet } = publicSettings.defaultNetworkConfig;
    const { web3Provider: web3Host } = publicSettings.urls;

    if (wallet.toLowerCase() !== adminWallet?.toLowerCase()) {
      Log("Unauthorized request", { req });
      return res.status(401).json("User must be admin");
    }

    const dao = new DAO({
      skipWindowAssignment: true,
      web3Host,
      registryAddress
    });

    if (!await dao.start()) return res.status(500).json("Failed to connect with chain");

    const registry = await dao.loadRegistry(true);

    if (!registry)
      return res.status(400).json("Invalid Registry address");

    const registryGovernor = await registry.governed._governor();

    if (registryGovernor.toLowerCase() !== wallet.toLowerCase())
      return res.status(401).json("User must be registry governor");

    await Database.settings.create({
      key: "networkRegistry",
      value: registryAddress,
      group: "contracts",
      type: "string",
      visibility: "public"
    });


    return res.status(200).json("Registry saved");
  } catch(error) {
    LogError("Failed to save network registry", { error, req });
    return res.status(500).json(error);
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

Logger.changeActionName(`Setup`);

export default LogAccess(handler)
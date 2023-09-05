import { NextApiRequest } from "next";
import { Op } from "sequelize";

import Database from "db/models";

import { chainFromHeader } from "helpers/chain-from-header";
import { handleRemoveTokens, handlefindOrCreateTokens } from "helpers/handleNetworkTokens";

import DAO from "services/dao-service";
import IpfsStorage from "services/ipfs-service";
import { Logger } from "services/logging";

import { HttpConflictError, HttpForbiddenError, HttpNotFoundError, HttpServerError } from "server/errors/http-errors";

export async function put(req: NextApiRequest) {
  const {
    name,
    colors,
    creator,
    logoIcon,
    fullLogo,
    isClosed,
    description,
    networkAddress,
    allowedTokens,
    isAdminOverriding
  } = req.body;

  const chain = await chainFromHeader(req);

  const network = await Database.network.findOne({
    where: {
      ...(isAdminOverriding ? {} : {
        creatorAddress: {[Op.iLike]: creator}
      }),
      networkAddress: {
        [Op.iLike]: networkAddress
      },
      chain_id: chain.chainId
    },
    include: [{ association: "repositories" }]
  });

  if (!network)
    throw new HttpNotFoundError("Invalid network");

  if (network.isClosed && !isAdminOverriding)
    throw new HttpConflictError("Network is closed");

  if (isClosed !== undefined) {
    network.isClosed = isClosed;

    await network.save();

    return "Network closed";
  }

  if (!chain.chainRpc || !chain.registryAddress)
    throw new HttpServerError("Chain is not configured");

  const DAOService = new DAO({ 
    skipWindowAssignment: true,
    web3Host: chain.chainRpc,
    registryAddress: chain.registryAddress,
  });

  if (!await DAOService.start())
    throw new HttpServerError("Failed to connect with chain");
  
  if (!await DAOService.loadRegistry())
    throw new HttpServerError("Failed to load registry");

  if (!isAdminOverriding) {
    const checkingNetworkAddress = await DAOService.getNetworkAdressByCreator(creator);
    
    if (checkingNetworkAddress?.toLowerCase() !== networkAddress?.toLowerCase())
      throw new HttpConflictError("Creator and network addresses do not match");
  } else {
    const isRegistryGovernor = await DAOService.isRegistryGovernor(creator);

    if (!isRegistryGovernor)
      throw new HttpForbiddenError("Not registry governor");
  }

  if (isAdminOverriding && name)
    network.name = name;

  if (description)
    network.description = description;

  if (colors)
    network.colors = colors;

  if (fullLogo || logoIcon) {
    try {
      const [full, logo] = await Promise.all([
        IpfsStorage.add(fullLogo, true, undefined, "svg"),
        IpfsStorage.add(logoIcon, true, undefined, "svg")
      ])

      if (logo?.hash) network.logoIcon = logo?.hash;
      if (full?.hash) network.fullLogo = full?.hash;

    } catch (error) {
      Logger.error(error, "Failed to store ipfs");
    }
  }

  network.save();

  if (allowedTokens) {
    const network_tokens = await Database.networkTokens.findAll({
      where: {
        networkId: network.id
      }
    });

    if (allowedTokens?.transactional?.length) { 
      for (const id of allowedTokens.transactional) {
        await handlefindOrCreateTokens(id, network.id, "transactional");
      }
    }

    const transactionalTokens = network_tokens.filter(e => e.isTransactional);

    for (const token of transactionalTokens) {
      await handleRemoveTokens(allowedTokens.transactional, token, "transactional");
    }

    if (allowedTokens?.reward?.length) {
      for (const id of allowedTokens.reward) {
        await handlefindOrCreateTokens(id, network.id, "reward");
      }
    } 
    const rewardTokens = network_tokens.filter(e => e.isReward);

    for (const token of rewardTokens) {
      await handleRemoveTokens(allowedTokens.reward, token, "reward");
    }
  }

  return "Network updated";
}
import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op} from "sequelize";

import Database from "db/models";

import {chainFromHeader} from "helpers/chain-from-header";
import { WANT_TO_CREATE_NETWORK } from "helpers/contants";
import decodeMessage from "helpers/decode-message";
import { UNAUTHORIZED } from "helpers/error-messages";
import { handlefindOrCreateTokens, handleRemoveTokens } from "helpers/handleNetworkTokens";
import {isAdmin} from "helpers/is-admin";
import {resJsonMessage} from "helpers/res-json-message";
import {Settings} from "helpers/settings";

import {withCors} from "middleware";
import { LogAccess } from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";

import DAO from "services/dao-service";
import IpfsStorage from "services/ipfs-service";
import {Logger} from 'services/logging';

const {serverRuntimeConfig} = getConfig();

const isTrue = (value: string) => value === "true";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName, creator: creatorAddress, isDefault, address, byChainId, chainName } = req.query;

  const chain = await chainFromHeader(req);

  const where = {
    ... isTrue(byChainId?.toString()) && chain ? { chain_id: { [Op.eq]: +chain?.chainId } } : {},
    ... networkName && {
      name: {
        [Op.iLike]: String(networkName)
      }
    } || {},
    ... creatorAddress && {
      creatorAddress: {
        [Op.iLike]: String(creatorAddress)
      }
    } || {},
    ... isDefault && {
      isDefault: isTrue(isDefault.toString())
    } || {},
    ... address && {
      networkAddress: { [Op.iLike]: String(address) },
    } || {}
  };

  const network = await Database.network.findOne({
    attributes: { exclude: ["id", "creatorAddress", "updatedAt"] },
    include: [
      { association: "tokens" },
      { association: "curators" },
      { association: "networkToken" },
      { 
        association: "chain",
        ... chainName ? {
          where: {
            chainShortName: chainName
          }
        } : {},
        required: !!chainName
      },
    ],
    where
  });
  
  if (!network)
    return res.status(200).json({});

  return res.status(200).json(network);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name: _name,
      colors,
      creator,
      fullLogo,
      logoIcon,
      description,
      repositories,
      botPermission,
      accessToken,
      githubLogin,
      allowedTokens,
      networkAddress,
      isDefault,
      signedMessage
    } = req.body;

    const name = _name?.replaceAll(" ", "-")?.toLowerCase();

    if (!botPermission) return res.status(403).json("Bepro-bot authorization needed");
    
    const chain = await chainFromHeader(req);

    const validateSignature = (assumedOwner: string) => 
      decodeMessage(chain.chainId, WANT_TO_CREATE_NETWORK, signedMessage, assumedOwner);

    if (!validateSignature(creator))
      return res.status(403).json("Invalid signature");

    const hasNetwork = await Database.network.findOne({
      where: {
        creatorAddress: creator,
        chain_id: +chain?.chainId,
        isClosed: false,
      }
    });

    if (hasNetwork) {
      return res.status(409).json("Already exists a network created for this wallet");
    }

    const sameNameOnOtherChain = await Database.network.findOne({
      where: {
        isClosed: false,
        chain_id: {
          [Op.not]: +chain?.chainId
        },
        name: {
          [Op.iLike]: name
        }
      }
    });

    if (sameNameOnOtherChain)
      if (!validateSignature(sameNameOnOtherChain.creatorAddress))
        return res.status(403).json("Network name owned by other wallet");

    const settings = await Database.settings.findAll({
      where: { visibility: "public" },
      raw: true,
    });

    const publicSettings = (new Settings(settings)).raw();

    const defaultNetwork = await Database.network.findOne({
        where: {
          isDefault: true,
          isClosed: false,
          chain_id: +chain?.chainId,
        }
    });

    if (isDefault && defaultNetwork)
      return resJsonMessage("Default Network already saved", res, 409);

    // Contract Validations
    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: chain.chainRpc,
      registryAddress: chain.registryAddress,
    });

    if (!await DAOService.start())
      return resJsonMessage("Failed to connect with chain", res, 400);
    
    if (!await DAOService.loadRegistry())
      return resJsonMessage("Failed to load registry", res, 400);

    if (await DAOService.hasNetworkRegistered(creator))
      return resJsonMessage("Already exists a network registered for this wallet", res, 403);

    // Uploading logos to IPFS
    let fullLogoHash = null
    let logoIconHash = null

    try {
      const [full, logo] = await Promise.all([
        IpfsStorage.add(fullLogo, true, undefined, "svg"),
        IpfsStorage.add(logoIcon, true, undefined, "svg")
      ])

      if (full?.hash) fullLogoHash = full.hash;
      if (logo?.hash) logoIconHash = logo.hash;

    } catch (error) {
      Logger.error(error, 'Failed to store ipfs');
    }

    const networkToken = await Database.tokens.findOne({
      where: {
        address: allowedTokens.settler,
        chain_id: chain.chainId
      }
    });

    let networkTokenId = null;

    if (networkToken)
      networkTokenId = networkToken.id;
    else {
      const { name, symbol } = await DAOService.getERC20TokenData(allowedTokens.settler);

      const createdToken = await Database.tokens.create({
        address: allowedTokens.settler,
        chain_id: chain.chainId,
        isTransactional: false,
        isAllowed: false,
        name,
        symbol
      });

      networkTokenId = createdToken.id;
    }

    const network = await Database.network.create({
      creatorAddress: creator,
      name: name,
      description,
      colors: JSON.parse(colors),
      logoIcon: logoIconHash,
      fullLogo: fullLogoHash,
      networkAddress,
      isDefault: isDefault || false,
      chain_id: +chain?.chainId,
      network_token_id: networkTokenId
    });

    const repos = JSON.parse(repositories);

    for (const repository of repos) {
      await Database.repositories.create({
        githubPath: repository.fullName,
        network_id: network.id
      });
    }

    if (!publicSettings?.github?.botUser) return res.status(500).json("Missing github bot user");
    if (!serverRuntimeConfig?.github?.token) return res.status(500).json("Missing github bot token");

    const octokitUser = new Octokit({
      auth: accessToken
    });

    const invitations = [];

    for (const repository of repos) {
      const [owner, repo] = repository.fullName.split("/");

      await octokitUser.rest.repos.addCollaborator({
        owner,
        repo,
        username: publicSettings.github.botUser,
        ...(githubLogin !== owner  && { permission: "admin"} || {})
      })
      .then(({data}) => invitations.push(data?.id))
      .catch((e) => {
        Logger.error(e, 'Add Collaborator Fail')
        return e;
      });
    }

    const octokitBot = new Octokit({
      auth: serverRuntimeConfig.github.token
    });

    for (const invitation_id of invitations) {
      if (invitation_id)
        await octokitBot.rest.repos.acceptInvitationForAuthenticatedUser({
          invitation_id
        })
          .catch((e)=>{
            Logger.error(e, 'Accept Invitation Fail')
            return e;
          });
    }

    //TODO: move tokens logic to new endpoint   
    if(allowedTokens?.allowedTransactions?.length > 0){
      for (const token of allowedTokens.allowedTransactions) {
        await handlefindOrCreateTokens(token.id, network.id, 'transactional')
      }
    }

    if(allowedTokens?.allowedRewards?.length > 0){
      for (const token of allowedTokens.allowedRewards) {
        await handlefindOrCreateTokens(token.id, network.id, 'reward')
      }
    }

    return res.status(200).json("Network created");
  } catch (error) {
    Logger.error(error, "Failed to create network", req.body);
    return res.status(500).json(error);
  }
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
      colors,
      creator,
      logoIcon,
      fullLogo,
      isClosed,
      override,
      accessToken,
      description,
      githubLogin,
      networkAddress,
      repositoriesToAdd,
      repositoriesToRemove,
      allowedTokens
    } = req.body;

    const isAdminOverriding = isAdmin(req) && !!override;

    if (!accessToken && !isAdminOverriding) return res.status(401).json({message: "Unauthorized user"});
    
    const network = await Database.network.findOne({
      where: {
        ...(isAdminOverriding ? {} : {
          creatorAddress: {[Op.iLike]: creator}
        }),
        networkAddress
      },
      include: [{ association: "repositories" }]
    });

    if (!network) return res.status(404).json("Invalid network");
    if (network.isClosed && !isAdminOverriding)
      return res.status(404).json("Invalid network");

    if (isClosed !== undefined) {
      network.isClosed = isClosed;

      await network.save();

      return res.status(200).json("Network closed");
    }

    const settings = await Database.settings.findAll({
      where: { visibility: "public" },
      raw: true,
    });

    const publicSettings = (new Settings(settings)).raw();

    const chain = await chainFromHeader(req);

    if (!chain.chainRpc)
      return resJsonMessage(`Missing chainRpc`, res, 400);

    if (!chain.registryAddress)
      return resJsonMessage(`Missing registryAddress`, res, 400);

    // Contract Validations
    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: chain.chainRpc,
      registryAddress: chain.registryAddress,
    });

    if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");
    if (!await DAOService.loadRegistry()) return res.status(500).json("Failed to load factory contract");

    if (!isAdminOverriding) {
      const checkingNetworkAddress = await DAOService.getNetworkAdressByCreator(creator);

      if (checkingNetworkAddress?.toLowerCase() !== networkAddress?.toLowerCase())
        return res.status(403).json("Creator and network addresses do not match");
    } else {
      const isRegistryGovernor = await DAOService.isRegistryGovernor(creator);

      if (!isRegistryGovernor) return res.status(403).json({message: UNAUTHORIZED});
    }

    const addingRepos = repositoriesToAdd ? JSON.parse(repositoriesToAdd) : [];

    if (addingRepos.length && !isAdminOverriding)
      for (const repository of addingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          },
          include: [
            {
              association: "network",
              where: {
                [Op.or]: [
                  {
                    name: { [Op.not]: network.name }
                  },
                  {
                    name: network.name,
                    creatorAddress: { [Op.not]: network.creatorAddress }
                  }
                ]
              }
            }
          ]
        });

        if (exists)
          return res
            .status(403)
            .json(`Repository ${repository.fullName} is already in use by another network `);
      }

    const removingRepos = repositoriesToRemove
      ? JSON.parse(repositoriesToRemove)
      : [];

    if (removingRepos.length && !isAdminOverriding)
      for (const repository of removingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
        });

        if (!exists) return res.status(404).json("Invalid repository");

        const hasIssues = await Database.issue.findOne({
          where: {
            repository_id: exists.id
          }
        });

        if (hasIssues)
          return res
            .status(403)
            .json(`Repository ${repository.fullName} already has bounties and cannot be removed`);
      }

    if (isAdminOverriding && name) network.name = name;

    network.description = description;

    if (colors) network.colors = JSON.parse(colors);

    if (fullLogo || logoIcon) {
      try {
        const [full, logo] = await Promise.all([
          IpfsStorage.add(fullLogo, true, undefined, "svg"),
          IpfsStorage.add(logoIcon, true, undefined, "svg")
        ])

        if (full?.hash) network.logoIcon = logo?.hash;
        if (logo?.hash) network.fullLogo = full?.hash;

      } catch (error) {
        Logger.error(error, 'Failed to store ipfs');
      }
    }

    network.save();

    if (addingRepos.length && !isAdminOverriding) {
      const octokitUser = new Octokit({
        auth: accessToken
      });

      const invitations = [];
  
      if (!publicSettings?.github?.botUser) return res.status(500).json("Missing github bot user");

      for (const repository of addingRepos) {
        const [owner, repo] = repository.fullName.split("/");

        const { data } = await octokitUser.rest.repos.addCollaborator({
          owner,
          repo,
          username: publicSettings?.github?.botUser,
          ...(githubLogin !== owner  && { permission: "maintain"} || {})
        })
          .catch((e) => {
            Logger.error(e, 'Add collaborator fail')
            return e;
          });

        if (data?.id) invitations.push(data?.id);
        
        await Database.repositories.create({
          githubPath: repository.fullName,
          network_id: network.id
        });
      }

      if (invitations.length) {
        const octokitBot = new Octokit({
          auth: serverRuntimeConfig?.github?.token
        });

        for (const invitation_id of invitations) {
          if (invitation_id)
            await octokitBot.rest.repos.acceptInvitationForAuthenticatedUser({
              invitation_id
            })
              .catch((e)=>{
                Logger.error(e, 'Accept invitation fail', {e})
                return e;
              });
        }
      }
    }
    const network_tokens = await Database.networkTokens.findAll({
      where: {
        networkId: network.id
      }
    });

    if(allowedTokens?.transactional?.length > 0){ 
      for (const id of allowedTokens.transactional) {
        await handlefindOrCreateTokens(id, network.id, 'transactional')
      }
    }

    const transactionalTokens = network_tokens.filter(e => e.isTransactional)
    for (const token of transactionalTokens){
      await handleRemoveTokens(allowedTokens.transactional, token, 'transactional')
    }

    if(allowedTokens?.reward?.length > 0){
      for (const id of allowedTokens.reward) {
        await handlefindOrCreateTokens(id, network.id, 'reward')
      }
    } 
    const rewardTokens = network_tokens.filter(e => e.isReward)
    for (const token of rewardTokens){
      await handleRemoveTokens(allowedTokens.reward, token, 'reward')
    }

    if (removingRepos.length && !isAdminOverriding)
      for (const repository of removingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
        });

        if (exists) await exists.destroy();
      }

    return res.status(200).json("Network updated");
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  case "post":
    await post(req, res);
    break;

  case "put":
    await put(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

Logger.changeActionName(`Network`);
export default LogAccess(withCors(WithValidChainId(handler)));

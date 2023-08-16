import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op, Sequelize} from "sequelize";

import Database from "db/models";

import {chainFromHeader} from "helpers/chain-from-header";
import {WANT_TO_CREATE_NETWORK} from "helpers/constants";
import decodeMessage from "helpers/decode-message";
import {handleCreateSettlerToken, handlefindOrCreateTokens, handleRemoveTokens} from "helpers/handleNetworkTokens";
import {resJsonMessage} from "helpers/res-json-message";
import {Settings} from "helpers/settings";

import {withProtected} from "middleware";
import { NetworkRoute } from "middleware/network-route";
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
    attributes: { exclude: ["creatorAddress", "updatedAt"] },
    include: [
      { association: "tokens" },
      { association: "curators" },
      { association: "networkToken" },
      { 
        association: "chain",
        ... chainName ? {
          where: {
            chainShortName: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("chain.chainShortName")), 
                                            "=",
                                            chainName.toString().toLowerCase())
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
      tokens,
      networkAddress,
      isDefault,
      signedMessage,
      allowMerge = true,
    } = req.body;

    if (!_name) {
      return resJsonMessage("Wrong payload", res, 400);
    }

    const name = _name.replaceAll(" ", "-").toLowerCase();

    if (!botPermission) return resJsonMessage("Bepro-bot authorization needed", res, 403);
    
    const chain = await chainFromHeader(req);

    const validateSignature = (assumedOwner: string) => 
      decodeMessage(chain.chainId, WANT_TO_CREATE_NETWORK, signedMessage, assumedOwner);

    if (!validateSignature(creator))
      return resJsonMessage("Invalid signature", res, 403);

    const hasNetwork = await Database.network.findOne({
      where: {
        creatorAddress: creator,
        chain_id: +chain?.chainId,
        isClosed: false,
      }
    });

    if (hasNetwork) {
      return resJsonMessage("Already exists a network created for this wallet", res, 409);
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
        return resJsonMessage("Network name owned by other wallet", res, 403);

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
    
    if (tokens?.settler && tokens?.settlerTokenMinAmount) {
      handleCreateSettlerToken(tokens?.settler,
                               tokens?.settlerTokenMinAmount,
                               chain.chainRpc,
                               +chain?.chainId);
    }


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
      allowMerge
    });

    const repos = JSON.parse(repositories);

    for (const repository of repos) {
      await Database.repositories.create({
        githubPath: repository.fullName,
        network_id: network.id
      });
    }

    if (!publicSettings?.github?.botUser) return resJsonMessage("Missing github bot user", res, 500);
    if (!serverRuntimeConfig?.github?.token) return resJsonMessage("Missing github bot token", res, 500);

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
    if(tokens?.allowedTransactions?.length > 0){
      for (const token of tokens.allowedTransactions) {
        await handlefindOrCreateTokens(token.id, network.id, 'transactional')
      }
    }

    if(tokens?.allowedRewards?.length > 0){
      for (const token of tokens.allowedRewards) {
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
      accessToken,
      description,
      githubLogin,
      networkAddress,
      repositoriesToAdd,
      repositoriesToRemove,
      allowedTokens,
      isAdminOverriding,
      allowMerge
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

    if (!network) return resJsonMessage("Invalid network", res, 404);
    if (network.isClosed && !isAdminOverriding)
      return resJsonMessage("Invalid network", res, 404);

    if (isClosed !== undefined) {
      network.isClosed = isClosed;

      await network.save();

      return resJsonMessage("Network closed", res, 200);
    }

    const settings = await Database.settings.findAll({
      where: { visibility: "public" },
      raw: true,
    });

    const publicSettings = (new Settings(settings)).raw();

    if (!chain.chainRpc)
      return resJsonMessage("Missing chainRpc", res, 400);

    if (!chain.registryAddress)
      return resJsonMessage("Missing registryAddress", res, 400);

    // Contract Validations
    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: chain.chainRpc,
      registryAddress: chain.registryAddress,
    });

    if (!await DAOService.start()) return resJsonMessage("Failed to connect with chain", res, 500);
    if (!await DAOService.loadRegistry()) return resJsonMessage("Failed to load registry contract", res, 500);

    if (!isAdminOverriding) {
      const checkingNetworkAddress = await DAOService.getNetworkAdressByCreator(creator);
      
      if (checkingNetworkAddress?.toLowerCase() !== networkAddress?.toLowerCase())
        return resJsonMessage("Creator and network addresses do not match", res, 403);
    } else {
      const isRegistryGovernor = await DAOService.isRegistryGovernor(creator);

      if (!isRegistryGovernor) return resJsonMessage("Unauthorized", res, 403);
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
          return resJsonMessage(`Repository ${repository.fullName} is already in use by another network `, res, 403);
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

        if (!exists) return resJsonMessage("Invalid repository", res, 404);

        const hasIssues = await Database.issue.findOne({
          where: {
            repository_id: exists.id
          }
        });

        if (hasIssues)
          return resJsonMessage(`Repository ${repository.fullName} already has bounties and cannot be removed`, 
                                res,
                                403);
      }

    if (isAdminOverriding && name) network.name = name;

    if (description) network.description = description;

    if (colors) network.colors = JSON.parse(colors);

    if (fullLogo || logoIcon) {
      try {
        const [full, logo] = await Promise.all([
          IpfsStorage.add(fullLogo, true, undefined, "svg"),
          IpfsStorage.add(logoIcon, true, undefined, "svg")
        ])

        if (logo?.hash) network.logoIcon = logo?.hash;
        if (full?.hash) network.fullLogo = full?.hash;

      } catch (error) {
        Logger.error(error, 'Failed to store ipfs');
      }
    }

    if (allowMerge !== undefined && allowMerge !== network.allowMerge)
      network.allowMerge = allowMerge;

    network.save();

    if (addingRepos.length && !isAdminOverriding) {
      const octokitUser = new Octokit({
        auth: accessToken
      });

      const invitations = [];

      if (!publicSettings?.github?.botUser) return resJsonMessage("Missing github bot user", res, 500);

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

    if (allowedTokens) {
      const network_tokens = await Database.networkTokens.findAll({
        where: {
          networkId: network.id
        }
      });
  
      if (allowedTokens?.transactional?.length) { 
        for (const id of allowedTokens.transactional) {
          await handlefindOrCreateTokens(id, network.id, 'transactional');
        }
      }
  
      const transactionalTokens = network_tokens.filter(e => e.isTransactional);
  
      for (const token of transactionalTokens) {
        await handleRemoveTokens(allowedTokens.transactional, token, 'transactional');
      }
  
      if (allowedTokens?.reward?.length) {
        for (const id of allowedTokens.reward) {
          await handlefindOrCreateTokens(id, network.id, 'reward');
        }
      } 
      const rewardTokens = network_tokens.filter(e => e.isReward);
  
      for (const token of rewardTokens) {
        await handleRemoveTokens(allowedTokens.reward, token, 'reward');
      }
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

    return resJsonMessage("Network updated", res, 200);
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
export default withProtected(WithValidChainId(NetworkRoute(handler)));

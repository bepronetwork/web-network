import {withCors} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import Sequelize, {Op} from "sequelize";

import Database from "db/models";

import {Settings} from "helpers/settings";

import DAO from "services/dao-service";
import IpfsStorage from "services/ipfs-service";
import {error as LogError} from 'services/logging';

const {serverRuntimeConfig} = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName, creator: creatorAddress, isDefault } = req.query;

  const where = {
    ... networkName && {
      name: {
        [Op.iLike]: String(networkName).replaceAll("-", " ")
      }
    } || {},
    ... creatorAddress && {
      creatorAddress: {
        [Op.iLike]: String(creatorAddress)
      }
    } || {},
    ... isDefault && {
      isDefault: isDefault === "true"
    } || {}
  };

  const network = await Database.network.findOne({
    attributes: { exclude: ["id", "creatorAddress", "updatedAt"] },
    include: [
      { association: "tokens" }
    ],
    where
  });
  
  if (!network) return res.status(404);

  return res.status(200).json(network);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      name,
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
      isDefault
    } = req.body;

    if (!botPermission) return res.status(403).json("Bepro-bot authorization needed");

    const hasNetwork = await Database.network.findOne({
      where: {
        creatorAddress: creator,
        isClosed: false,
      }
    });

    if(hasNetwork){
      return res.status(409).json("Already exists a network created for this wallet");
    }

    const settings = await Database.settings.findAll({
      where: { visibility: "public" },
      raw: true,
    });

    const publicSettings = (new Settings(settings)).raw();

    if (!publicSettings?.contracts?.networkRegistry) return res.status(500).json("Missing network registry contract");
    if (!publicSettings?.urls?.web3Provider) return res.status(500).json("Missing web3 provider url");
    if (isDefault && creator !== publicSettings?.defaultNetworkConfig?.adminWallet)
      return res.status(401).json("Unauthorized");

    const defaultNetwork = await Database.network.findOne({
        where: {
          isDefault: true
        }
    });
    
    if (isDefault && defaultNetwork)
      return res.status(409).json("Default Network already saved");

    // Contract Validations
    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: publicSettings.urls.web3Provider,
      registryAddress: publicSettings.contracts.networkRegistry
    });

    if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");
    
    if (!await DAOService.loadRegistry()) return res.status(500).json("Failed to load registry");

    if (await DAOService.hasNetworkRegistered(creator))
      return res.status(403).json("Already exists a network registered for this wallet");

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
      console.error('Failed to store ipfs', error);
    }

    const network = await Database.network.create({
      creatorAddress: creator,
      name: name.toLowerCase(),
      description,
      colors: JSON.parse(colors),
      logoIcon: logoIconHash,
      fullLogo: fullLogoHash,
      networkAddress,
      isDefault: isDefault || false
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
        ...(githubLogin !== owner  && { permission: "maintain"} || {})
      })
      .then(({data}) => invitations.push(data?.id))
      .catch((e) => {
        LogError('[GH Add Colaborator Fail]', {e})
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
        }).catch((e)=>{
          LogError('[GH Accpet Invitation Fail]', {e})
          return e;
        });
    }

    //TODO: move tokens logic to new endpoint   
    if(allowedTokens?.allowedTransactions?.length > 0){
      for (const token of allowedTokens.allowedTransactions) {
        await Database.networkTokens.create({
          networkId: network.id,
          tokenId: token.id
        })
      }
    }

    if(allowedTokens?.allowedRewards?.length > 0){
      for (const token of allowedTokens.allowedRewards) {
        await Database.networkTokens.create({
          networkId: network.id,
          tokenId: token.id
        })
      }
    }

    return res.status(200).json("Network created");
  } catch (error) {
    LogError("Failed to create network", { error, req });
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
      allAllowedTokens
    } = req.body;

    const isAdminOverriding = !!override;

    if (!accessToken && !isAdminOverriding) return res.status(401).json("Unauthorized user");
    
    const network = await Database.network.findOne({
      where: {
        ...(isAdminOverriding ? {} : { 
          creatorAddress: 
            Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("creatorAddress")), "=", creator.toLowerCase()) 
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

    if (!publicSettings?.contracts?.networkRegistry) return res.status(500).json("Missing network registry contract");
    if (!publicSettings?.urls?.web3Provider) return res.status(500).json("Missing web3 provider url");

    // Contract Validations
    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: publicSettings.urls.web3Provider,
      registryAddress: publicSettings.contracts.networkRegistry
    });

    if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");
    if (!await DAOService.loadRegistry()) return res.status(500).json("Failed to load factory contract");

    if (!isAdminOverriding) {
      const checkingNetworkAddress = await DAOService.getNetworkAdressByCreator(creator);

      if (checkingNetworkAddress !== networkAddress)
        return res.status(403).json("Creator and network addresses do not match");
    } else {
      const isRegistryGovernor = await DAOService.isRegistryGovernor(creator);

      if (!isRegistryGovernor) return res.status(403).json("Unauthorized");
    }

    const addingRepos = repositoriesToAdd ? JSON.parse(repositoriesToAdd) : [];

    if (addingRepos.length && !isAdminOverriding)
      for (const repository of addingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
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
        console.error('Failed to store ipfs', error);
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
            });
        }
      }
    }
    
    const network_tokens = await Database.networkTokens.findAll({
      where: {
        networkId: network.id
      }
    });

    const addTokens = allAllowedTokens?.map(tokenId => {
      const valid = network_tokens.find(networkToken => networkToken.tokenId === tokenId)
      if(!valid) return tokenId
    }).filter(v => v)

    const removeTokens = network_tokens.map(networkToken => {
      const valid = allAllowedTokens?.find(number => number === networkToken.tokenId)
      if(!valid) return networkToken.tokenId
    }).filter(v => v)

    if(addTokens?.length > 0){
      for (const id of addTokens) {
        await Database.networkTokens.create({
          networkId: network.id,
          tokenId: id
        });
      }
    }

    if(removeTokens?.length > 0){
      for (const id of removeTokens) {
        const exists = await Database.networkTokens.findOne({
          where: {
            networkId: network.id,
            tokenId: id
          }
        });
        if (exists) await exists.destroy();
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

export default withCors(handler)
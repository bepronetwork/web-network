import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import Database from "db/models";

import Bepro from "helpers/api/bepro-initializer";

import IpfsStorage from "services/ipfs-service";

const { publicRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName } = req.query;

  const network = await Database.network.findOne({
    attributes: { exclude: ["id", "creatorAddress", "updatedAt"] },
    include: [
      { association: "tokens" }
    ],
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
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
      accessToken,
      description,
      githubLogin,
      repositories,
      botPermission,
      networkAddress
    } = req.body;

    const user = await Database.user.findOne({
      where: {
        githubLogin,
        address: creator.toLowerCase()
      }
    });

    if (!user) return res.status(403).json("Invalid user provided");
    if (!accessToken) return res.status(401).json("Unauthorized user");
    if (!botPermission) return res.status(403).json("Bepro-bot authorization needed");

    // Contract Validations
    const BEPRO = new Bepro();
    await BEPRO.init(false, false, true);

    const creatorAmount = await BEPRO.networkFactory.creatorAmount();
    const lockedAmount = await BEPRO.networkFactory.lockedTokensOfAddress(creator);
    const checkingNetworkAddress = await BEPRO.networkFactory.networkOfAddress(creator);

    if (lockedAmount < creatorAmount) return res.status(403).json("Insufficient locked amount");

    if (checkingNetworkAddress !== networkAddress)
      return res.status(403).json("Creator and network addresses do not match");

    // Uploading logos to IPFS
    let fullLogoHash = null
    let logoIconHash = null

    try {
      const [full, logo] = await Promise.all([
        IpfsStorage.add(fullLogo, true, undefined, "svg"),
        IpfsStorage.add(logoIcon, true, undefined, "svg")
      ])

      fullLogoHash = full?.hash;
      logoIconHash = logo.hash;

    } catch (error) {
      console.error('Failed to store ipfs', error);
    }

    // Adding bepro-bot to repositories organization
    const octokitUser = new Octokit({
      auth: accessToken
    });

    const repos = JSON.parse(repositories);

    const invitations = [];

    for (const repository of repos) {
      const [owner, repo] = repository.fullName.split("/");

      const { data } = await octokitUser.rest.repos.addCollaborator({
        owner,
        repo,
        username: publicRuntimeConfig?.github?.user,
        permission: 'maintain'
      });

      if (data?.id) invitations.push(data?.id);
    }

    const octokitBot = new Octokit({
      auth: publicRuntimeConfig?.github?.token
    });

    for (const invitation_id of invitations) {
      if (invitation_id)
        await octokitBot.rest.repos.acceptInvitationForAuthenticatedUser({
          invitation_id
        });
    }

    const network = await Database.network.create({
      creatorAddress: creator,
      name: name.toLowerCase(),
      description,
      colors: JSON.parse(colors),
      networkAddress,
      logoIcon: logoIconHash,
      fullLogo: fullLogoHash
    });

    for (const repository of repos) {
      await Database.repositories.create({
        githubPath: repository.fullName,
        network_id: network.id
      });
    }

    return res.status(200).json("Network created");
  } catch (error) {
    console.log(error);
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
      repositoriesToRemove
    } = req.body;

    const isAdminOverriding = !!override;

    if (
      isAdminOverriding &&
      creator !== publicRuntimeConfig?.adminWalletAddress
    )
      return res.status(403).json("Unauthorized");

    const user = await Database.user.findOne({
      where: {
        githubLogin,
        address: creator.toLowerCase()
      }
    });

    if (!user) return res.status(403).json("Invalid user provided");
    if (!accessToken) return res.status(401).json("Unauthorized user");

    const network = await Database.network.findOne({
      where: {
        ...(isAdminOverriding ? {} : { creatorAddress: creator }),
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

    if (!isAdminOverriding) {
      // Contract Validations
      const BEPRO = new Bepro();
      await BEPRO.init(false, false, true);

      const checkingNetworkAddress =
        await BEPRO.networkFactory.networkOfAddress(creator);

      if (checkingNetworkAddress !== networkAddress)
        return res
          .status(403)
          .json("Creator and network addresses do not match");
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

    if (!isAdminOverriding) network.colors = JSON.parse(colors);

    if (fullLogo || logoIcon) {
      try {
        const [full, logo] = await Promise.all([
          IpfsStorage.add(fullLogo, true, undefined, "svg"),
          IpfsStorage.add(logoIcon, true, undefined, "svg")
        ])

        network.logoIcon = full?.hash;
        network.fullLogo = logo.hash;

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

      for (const repository of addingRepos) {
        const [owner, repo] = repository.fullName.split("/");

        const { data } = await octokitUser.rest.repos.addCollaborator({
          owner,
          repo,
          username: publicRuntimeConfig?.github?.user,
          permission: 'maintain'
        });

        if (data?.id) invitations.push(data?.id);

        await Database.repositories.create({
          githubPath: repository.fullName,
          network_id: network.id
        });
      }

      if (invitations.length) {
        const octokitBot = new Octokit({
          auth: publicRuntimeConfig?.github?.token
        });

        for (const invitation_id of invitations) {
          if (invitation_id)
            await octokitBot.rest.repos.acceptInvitationForAuthenticatedUser({
              invitation_id
            });
        }
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

async function NetworkEndPoint(req: NextApiRequest,
                               res: NextApiResponse) {
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

export default withCors(NetworkEndPoint)
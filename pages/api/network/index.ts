import { Op } from 'sequelize'
import { Octokit } from 'octokit'
import { NextApiRequest, NextApiResponse } from 'next'

import Database from '@db/models'

import Bepro from '@helpers/api/bepro-initializer'

import IpfsStorage from '@services/ipfs-service'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName } = req.query

  const network = await Database.network.findOne({
    attributes: { exclude: ['id', 'creatorAddress', 'updatedAt'] },
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  })

  if (!network) return res.status(404)

  return res.status(200).json(network)
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
      githubLogin,
      repositories,
      botPermission,
      networkAddress
    } = req.body

    const user = await Database.user.findOne({
      where: {
        githubLogin,
        address: creator.toLowerCase()
      }
    })

    if (!user) return res.status(403).json('Invalid user provided')
    if (!user.accessToken) return res.status(401).json('Unauthorized user')
    if (!botPermission)
      return res.status(403).json('Bepro-bot authorization needed')

    // Contract Validations
    const BEPRO = new Bepro()
    await BEPRO.init(false, false, true)

    const OPERATOR_AMOUNT = await BEPRO.networkFactory.OPERATOR_AMOUNT()
    const amountStaked = await BEPRO.networkFactory.getLockedStakedByAddress(
      creator
    )
    const checkingNetworkAddress =
      await BEPRO.networkFactory.getNetworkByAddress(creator)

    if (
      parseFloat(BEPRO.bepro.Web3.utils.fromWei(`${amountStaked}`)) <
      OPERATOR_AMOUNT
    )
      return res.status(403).json('Insufficient locked amount')

    if (checkingNetworkAddress !== networkAddress)
      return res.status(403).json('Creator and network addresses do not match')

    // Uploading logos to IPFS
    const fullLogoHash = (
      await IpfsStorage.add(fullLogo, true, undefined, 'svg')
    ).hash
    const logoIconHash = (
      await IpfsStorage.add(logoIcon, true, undefined, 'svg')
    ).hash

    // Adding bepro-bot to repositories organization
    const octokitUser = new Octokit({
      auth: user.accessToken
    })

    const repos = JSON.parse(repositories)

    const invitations = []

    for (const repository of repos) {
      const [owner, repo] = repository.fullName.split('/')

      const { data } = await octokitUser.rest.repos.addCollaborator({
        owner,
        repo,
        username: process.env.NEXT_PUBLIC_GITHUB_LOGIN
      })

      if (data?.id) invitations.push(data?.id)
    }

    const octokitBot = new Octokit({
      auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
    })

    for (const invitation_id of invitations) {
      if (invitation_id)
        await octokitBot.rest.repos.acceptInvitationForAuthenticatedUser({
          invitation_id
        })
    }

    const network = await Database.network.create({
      creatorAddress: creator,
      name: name.toLowerCase(),
      description,
      colors: JSON.parse(colors),
      networkAddress,
      logoIcon: logoIconHash,
      fullLogo: fullLogoHash
    })

    for (const repository of repos) {
      await Database.repositories.create({
        githubPath: repository.fullName,
        network_id: network.id
      })
    }

    return res.status(200).json('Network created')
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
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
      description,
      githubLogin,
      networkAddress,
      repositoriesToAdd,
      repositoriesToRemove
    } = req.body

    const isAdminOverriding = !!override

    if (
      isAdminOverriding &&
      creator !== process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
    )
      return res.status(403).json('Unauthorized')

    const user = await Database.user.findOne({
      where: {
        githubLogin,
        address: creator.toLowerCase()
      }
    })

    if (!user) return res.status(403).json('Invalid user provided')
    if (!user.accessToken) return res.status(401).json('Unauthorized user')

    const network = await Database.network.findOne({
      where: {
        ...(isAdminOverriding ? {} : {creatorAddress: creator}),
        networkAddress
      },
      include: [{ association: 'repositories' }]
    })

    if (!network) return res.status(404).json('Invalid network')
    if (network.isClosed && !isAdminOverriding) return res.status(404).json('Invalid network')

    if (isClosed !== undefined) {
      network.isClosed = isClosed

      await network.save()

      return res.status(200).json('Network closed')
    }

    if (!isAdminOverriding) {
      // Contract Validations
      const BEPRO = new Bepro()
      await BEPRO.init(false, false, true)

      const checkingNetworkAddress =
        await BEPRO.networkFactory.getNetworkByAddress(creator)

      if (checkingNetworkAddress !== networkAddress)
        return res
          .status(403)
          .json('Creator and network addresses do not match')
    }

    // Uploading logos to IPFS
    const fullLogoHash = fullLogo
      ? (await IpfsStorage.add(fullLogo, true, undefined, 'svg')).hash
      : undefined
    const logoIconHash = logoIcon
      ? (await IpfsStorage.add(logoIcon, true, undefined, 'svg')).hash
      : undefined

    const addingRepos = repositoriesToAdd ? JSON.parse(repositoriesToAdd) : []

    if (addingRepos.length && !isAdminOverriding)
      for (const repository of addingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
        })

        if (exists)
          return res
            .status(403)
            .json(
              `Repository ${repository.fullName} is already in use by another network `
            )
      }

    const removingRepos = repositoriesToRemove ? JSON.parse(repositoriesToRemove) : []

    if (removingRepos.length && !isAdminOverriding)
      for (const repository of removingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
        })

        if (!exists) return res.status(404).json(`Invalid repository`)

        const hasIssues = await Database.issue.findOne({
          where: {
            repository_id: exists.id
          }
        })

        if (hasIssues)
          return res
            .status(403)
            .json(
              `Repository ${repository.fullName} already has bounties and cannot be removed`
            )
      }

    if (isAdminOverriding && name)
      network.name = name

    network.description = description

    if (!isAdminOverriding)
      network.colors = JSON.parse(colors)

    if (logoIconHash) network.logoIcon = logoIconHash
    if (fullLogoHash) network.fullLogo = fullLogoHash

    network.save()

    if (addingRepos.length && !isAdminOverriding)
      for (const repository of addingRepos) {
        await Database.repositories.create({
          githubPath: repository.fullName,
          network_id: network.id
        })
      }

    if (removingRepos.length && !isAdminOverriding)
      for (const repository of removingRepos) {
        const exists = await Database.repositories.findOne({
          where: {
            githubPath: { [Op.iLike]: String(repository.fullName) }
          }
        })

        if (exists) await exists.destroy()
      }

    return res.status(200).json('Network updated')
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}

export default async function NetworkEndPoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res)
      break

    case 'post':
      await post(req, res)
      break

    case 'put':
      await put(req, res)
      break

    default:
      res.status(405).json(`Method not allowed`)
  }

  res.end()
}

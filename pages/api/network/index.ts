import { Octokit } from 'octokit'
import { Op } from 'sequelize'
import { NextApiRequest, NextApiResponse } from 'next'

import Database from '@db/models'

import Bepro from '@helpers/api/bepro-initializer'

import IpfsStorage from '@services/ipfs-service'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName } = req.query

  const network = await Database.network.findOne({
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
      description,
      colors,
      repositories,
      botPermission,
      creator,
      githubLogin,
      networkAddress,
      fullLogo,
      logoIcon
    } = req.body

    const user = await Database.user.findOne({
      where: {
        githubLogin,
        address: creator.toLowerCase()
      }
    })

    if (!user) return res.status(403).json('Invalid user provided')
    if (!user.accessToken) return res.status(401).json('Unauthorized user')
    if (!botPermission) return res.status(403).json('Bepro-bot authorization needed')

    const repos = JSON.parse(repositories)

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
    const fullLogoHash = (await IpfsStorage.add(fullLogo, 'svg')).hash
    const logoIconHash = (await IpfsStorage.add(logoIcon, 'svg')).hash

    // Adding bepro-bot to repositories organization
    const octokitUser = new Octokit({
      auth: user.accessToken
    })

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
      name,
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

    return res.status(200).json('For now, its okay')
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

    default:
      res.status(405).json(`Method not allowed`)
  }

  res.end()
}

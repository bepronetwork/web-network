import { Op } from 'sequelize'
import models from '@db/models'
import { NextApiRequest, NextApiResponse } from 'next'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { name: networkName} = req.query

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  })

  if (!network) return res.status(404)

  return res.status(200).json(network)
}

export default async function NetworkEndPoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res)
      break

    default:
      res.status(405).json(`Method not allowed`)
  }

  res.end()
}

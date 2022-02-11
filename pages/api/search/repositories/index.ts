import { Op, WhereOptions, Sequelize } from 'sequelize'
import { NextApiRequest, NextApiResponse } from 'next'

import models from '@db/models'

import paginate, { calculateTotalPages } from '@helpers/paginate'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {}

  const { owner, name, path, networkName, page } = req.query || {}

  if (path)
    (whereCondition.githubPath = Sequelize.fn('lower', Sequelize.col('githubPath'))),
      {
        [Op.in]: String(path).split(',')
      }
      
  if (name) whereCondition.githubPath = { [Op.iLike]: `%${name}%` }
  if (owner) whereCondition.githubPath = { [Op.iLike]: `%${owner}%` }
  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    })

    if (!network) return res.status(404).json('Invalid network')

    whereCondition.network_id = network.id
  }

  const repositories = await models.repositories.findAndCountAll(
    paginate({ where: whereCondition, nest: true }, req.query, [])
  )

  return res.status(200).json({
    ...repositories,
    currentPage: +page || 1,
    pages: calculateTotalPages(repositories.count)
  })
}

export default async function SearchRepositories(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res)
      break

    default:
      res.status(405)
  }

  res.end()
}

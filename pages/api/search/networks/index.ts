import { Op, WhereOptions } from 'sequelize'
import { NextApiRequest, NextApiResponse } from 'next'
import { subHours, subMonths, subWeeks, subYears } from 'date-fns'

import models from '@db/models'

import paginate, { calculateTotalPages } from '@helpers/paginate'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = {}

  const { name, creatorAddress, networkAddress, page } = req.query || {}

  if (name) whereCondition.name = name

  if (creatorAddress) whereCondition.creatorAddress = { [Op.iLike]: String(creatorAddress) }

  if (networkAddress) whereCondition.repository_id = networkAddress

  const networks = await models.network.findAndCountAll(
    paginate({ where: whereCondition, nest: true }, req.query, [
      [req.query.sortBy || 'updatedAt', req.query.order || 'DESC']
    ])
  )

  return res.status(200).json({
    ...networks,
    currentPage: +page || 1,
    pages: calculateTotalPages(networks.count)
  })
}

export default async function SearchNetworks(
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

import { Op, WhereOptions } from 'sequelize'
import { NextApiRequest, NextApiResponse } from 'next'
import { subHours, subMonths, subWeeks, subYears } from 'date-fns'

import models from '@db/models'

import { searchPatternInText } from '@helpers/string'
import paginate, { calculateTotalPages, paginateArray } from '@helpers/paginate'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = { state: { [Op.not]: `pending` } }
  const {
    state,
    issueId,
    repoId,
    time,
    creator,
    address,
    search,
    page,
    pullRequester,
    networkName
  } = req.query || {}

  if (state) whereCondition.state = state

  if (issueId) whereCondition.issueId = issueId

  if (repoId) whereCondition.repository_id = repoId

  if (creator) whereCondition.creatorGithub = creator

  if (address) whereCondition.creatorAddress = address

  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    })

    if (!network) return res.status(404).json('Invalid network')

    whereCondition.network_id = network?.id
  }

  if (time) {
    let fn
    if (time === `week`) fn = subWeeks
    if (time === `month`) fn = subMonths
    if (time === `year`) fn = subYears
    if (time === `hour`) fn = subHours

    if (!fn) return res.status(422).json(`Unable to parse date`)

    whereCondition.createdAt = { [Op.gt]: fn(+new Date(), 1) }
  }

  const include = [
    { association: 'developers' },
    {
      association: 'pullRequests',
      ...(pullRequester ? { where: { githubLogin: pullRequester } } : {})
    },
    { association: 'mergeProposals' },
    { association: 'repository' }
  ]

  if (search) {
    const issues = await models.issue.findAll({
      where: whereCondition,
      include,
      nest: true,
      order: [[req.query.sortBy || 'createdAt', req.query.order || 'DESC']]
    })

    const result = []

    result.push(
      ...issues.filter(({ title, body }) =>
        [title, body].some((text) => searchPatternInText(text || '', String(search)))
      )
    )

    const paginatedData = paginateArray(result, 10, page || 1)

    return res.status(200).json({
      count: result.length,
      rows: paginatedData.data,
      pages: paginatedData.pages,
      currentPage: +paginatedData.page
    })
  } else {
    const issues = await models.issue.findAndCountAll(
      paginate({ where: whereCondition, include, nest: true }, req.query, [
        [req.query.sortBy || 'updatedAt', req.query.order || 'DESC']
      ])
    )

    return res.status(200).json({
      ...issues,
      currentPage: +page || 1,
      pages: calculateTotalPages(issues.count),
    })
  }
}

export default async function SearchIssues(
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

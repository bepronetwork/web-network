import { Op, WhereOptions } from 'sequelize'
import { NextApiRequest, NextApiResponse } from 'next'
import { subHours, subMonths, subWeeks, subYears } from 'date-fns'

import models from '@db/models'

import { paginateArray } from '@helpers/paginate'
import { searchPatternInText } from '@helpers/string'

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
    pullRequester
  } = req.query || {}

  if (state) whereCondition.state = state

  if (issueId) whereCondition.issueId = issueId

  if (repoId) whereCondition.repository_id = repoId

  if (creator) whereCondition.creatorGithub = creator

  if (address) whereCondition.creatorAddress = address

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

  const issues = await models.issue.findAll({
    where: whereCondition,
    include,
    nest: true,
    order: [[req.query.sortBy || 'createdAt', req.query.order || 'DESC']]
  })

  const result = []

  if (search)
    result.push(
      ...issues.filter(({ title, body }) =>
        [title, body].some((text) => searchPatternInText(text, String(search)))
      )
    )
  else result.push(...issues)

  const paginatedData = paginateArray(result, 10, page || 1)

  return res.status(200).json({
    count: result.length,
    rows: paginatedData.data,
    pages: paginatedData.pages,
    currentPage: paginatedData.page
  })
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

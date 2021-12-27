import { NextApiRequest, NextApiResponse } from 'next'
import { Op, WhereOptions } from 'sequelize'
import { subHours, subMonths, subWeeks, subYears } from 'date-fns'

import models from '@db/models'
import { paginateArray } from '@helpers/paginate'
import { searchPatternInText } from '@helpers/string'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const whereCondition: WhereOptions = { state: { [Op.not]: `pending` } }
  const { state, issueId, repoId, time, creator, address, search, page } =
    req.query || {}

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
    { association: 'pullRequests' },
    { association: 'mergeProposals' },
    { association: 'repository' }
  ]

  let issues = await models.issue.findAll({
    where: whereCondition,
    include,
    nest: true,
    order: [[req.query.sortBy || 'createdAt', req.query.order || 'DESC']]
  })

  if (search)
    issues = issues.filter(
      (issue) =>
        searchPatternInText(issue.title, String(search)) ||
        searchPatternInText(issue.body, String(search))
    )
  
  const paginatedData = paginateArray(issues, 10, page || 1)

  return res.status(200).json({ count: issues.length, rows: paginatedData.data, pages: paginatedData.pages, currentDage: paginatedData.page })
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

import { NextApiRequest, NextApiResponse } from 'next'
import models from '@db/models'
import { Octokit } from 'octokit'

async function get(req: NextApiRequest, res: NextApiResponse) {
  const issuesWithcount = await models.issue.findAndCountAll({
    include: [{ association: 'repository' }],
    raw: true
  })

  const issues = []

  if (!issuesWithcount.count) return res.status(404).json('No issues found')

  const octokit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN })

  for (const issue of issuesWithcount.rows) {
    const [owner, repo] = issue['repository.githubPath'].split('/')

    const {
      data: { title, body }
    } = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issue.githubId
    })

    issues.push({
      ...issue,
      title,
      body
    })
  }

  return res.status(200).json(issues)
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

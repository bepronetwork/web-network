import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from 'octokit'

import models from '@db/models'

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, githubLogin } = req.body

  try{
    const issue = await models.issue.findOne({ where: { issueId } })

    if (!issue)
      return res.status(404).json('Issue not found')

    if (!issue.working.find(el => el === String(githubLogin))) {
      const repository = await models.repositories.findOne({ where: { id: issue.repository_id } })
      const [owner, repo] = repository.githubPath.split('/')

      issue.working = [...issue.working, githubLogin]
      
      await issue.save()

      const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN})

      const response = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issue.githubId,
        body: `@${githubLogin} is working on this.`
      })

      return res.status(response.status).json(response.data)
    }

    return res.status(409).json('Already working')
  } catch(error) {
    return res.status(error.response?.status || 500).json(error.response?.data || error)
  }
}

export default async function Working(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'put':
        await put(req, res)
      break

    default:
      res.status(405)
  }

  res.end()
}

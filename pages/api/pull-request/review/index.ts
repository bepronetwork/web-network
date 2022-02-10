import { Op } from 'sequelize'
import { Octokit } from 'octokit'
import { NextApiRequest, NextApiResponse } from 'next'

import models from '@db/models'

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, githubLogin, body, networkName } = req.body

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    })
  
    if (!network) return res.status(404).json('Invalid network')

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    })

    if (!issue) return res.status(404).json('Issue not found')

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    })

    if (!pullRequest) return res.status(404).json('Pull Request not found')

    const repository = await models.repositories.findOne({
      where: { id: issue.repository_id }
    })

    const [owner, repo] = repository.githubPath.split('/')

    const octoKit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN })

    const octoResponse = await octoKit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pullRequest.githubId,
      body: `<p>@${githubLogin} reviewed this with the following message:</p><p>${body}</p>`
    })

    if (!pullRequest.reviewers.find(el => el === String(githubLogin))) {
      pullRequest.reviewers = [...pullRequest.reviewers, githubLogin]
      
      await pullRequest.save()
    }

    return res.status(octoResponse.status).json(octoResponse.data)
  } catch (error) {
    return res.status(error.status || 500).json(error.response?.data || error)
  }
}

export default async function PullRequestReview(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case 'put':
      await put(req, res)
      break

    default:
      res.status(405)
  }

  res.end()
}

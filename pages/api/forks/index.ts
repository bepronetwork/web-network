import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit'

import models from '@db/models'

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { repoPath } = req.body

  const repository = await models.repositories.findOne({ where: { githubPath: repoPath } })

  if (!repository)
    return res.status(422).json('Repository not found')

  const [owner, repo] = repoPath.split(`/`)
  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN})

  try {
    const response = await octokit.rest.repos.createFork({
      owner,
      repo,
    })

    console.log(response)

    return res.status(response.status).json('success')
  } catch(error) {
    console.log(error)
    return res.status(error.response.status).json(error.response.data)
  }
}

export default async function RepoRoute(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {    
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

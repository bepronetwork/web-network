import { NextApiRequest, NextApiResponse } from 'next';
import { Octokit } from 'octokit'

function get(req: NextApiRequest, res: NextApiResponse) {

}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.body

  switch (type) {
    case 'issue':
      const { repoPath, issueId, body } = req.body
      const [owner, repo] = repoPath.split(`/`)

      const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN})

      try {
        const response = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: issueId,
          body
        })
    
        return res.status(response.status).json(response.data)
      } catch(error) {
        console.log(error)
        return res.status(error.response.status).json(error.response.data)
      }

      break
  
    default:
        return res.status(404).json('Not found')
      break
  }
}

export default async function Comments(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;
    
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

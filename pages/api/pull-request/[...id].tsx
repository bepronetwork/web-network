import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import { Octokit } from 'octokit';

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const {id} = req.query;
  
  const include = [
    { association: 'issue', include: [{association: 'repository'}] },
  ]

  const pr = await models.pullRequest.findOne({
    where: {
      githubId: id
    },
    include
  })

  
  if (!pr)
    return res.status(404).json(null);
  
  const [owner, repo] = pr.issue.repository.githubPath.split('/')

  const octoKit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});
  
  const options = {
    accept: 'application/vnd.github.v3+json',
    owner,
    repo,
    pull_number: Number(id),
  }

  const {data} = await octoKit.rest.pulls.get(options);

  pr.mergeable = data.mergeable;
  pr.merged = data.merged;
  
  await pr.save();
  
  return res.status(200).json(pr);
}

export default async function GetIssues(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'patch':
      await patch(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

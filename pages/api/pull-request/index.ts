import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';

async function get(req: NextApiRequest, res: NextApiResponse) {}
async function post(req: NextApiRequest, res: NextApiResponse) {
  const {repoId: repository_id, githubId, title, description: body, username: owner} = req.body;

  const issue = await models.issue.findOne({where: {githubId, repository_id,},});
  const repoInfo = await models.repositories.findOne({where: {id: repository_id}, raw: true});

  const repo = repoInfo.split(`/`)[1];

  const octoKit = new Octokit({auth: process.env.NEXT_GITHUB_TOKEN});

  const options = {
    accept: 'application/vnd.github.v3+json',
    owner, repo, title, body,
    head: `${owner}:${process.env.NEXT_GITHUB_MAINBRANCH}`,
    base: process.env.NEXT_GITHUB_MAINBRANCH,
    maintainer_can_modify: false,
    draft: false
  }

  const created = await octoKit.rest.pulls.create(options);
  if (!created.data?.number)
    return res.status(created.status).json(created.data)

  await models.pullRequest.create({issueId: issue.id, githubId: created.data?.number,});

  issue.state = `ready`;
  await issue.save();

  return res.json(`ok`);
}

export default async function PullRequest(req: NextApiRequest, res: NextApiResponse) {

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

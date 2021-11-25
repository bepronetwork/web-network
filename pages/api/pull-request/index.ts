import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {login, issueId} = req.query;

  if (!issueId)
    return res.status(422);

  const find = await models.issue.findOne({where: {issueId}});
  if (!find)
    return res.status(422);

  const where = {
    issueId: find.id,
    ... login && {githubLogin: login} || {}
  };

  const prs = await models.pullRequest.findOne({where, raw: true});

  return res.status(200).json(prs)
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {repoId: repository_id, githubId, title, description: body, username, branch} = req.body;

  const issue = await models.issue.findOne({where: {githubId, repository_id,},});
  const repoInfo = await models.repositories.findOne({where: {id: repository_id}, raw: true});

  const [owner, repo] = repoInfo.githubPath.split(`/`);

  const octoKit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

  const options = {
    accept: 'application/vnd.github.v3+json',
    owner, repo, title, body,
    head: `${username}:${branch}`,
    base: process.env.NEXT_GITHUB_MAINBRANCH,
    maintainer_can_modify: false,
    draft: false
  }

  try {
    const created = await octoKit.rest.pulls.create(options);

    await models.pullRequest.create({issueId: issue.id, githubId: created.data?.number, githubLogin: username, branch});

    issue.state = `ready`;

    await issue.save();

    return res.json(`ok`);
  } catch(error) {
    return res.status(error.response.status).json(error.response.data)
  }
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

import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {login, issueId} = req.query;

  console.log(req.query);

  if (!issueId)
    return res.status(422);

  const find = await models.issue.findOne({where: {issueId}});
  if (!find)
    return res.status(422);

  let where = {
    issueId: find.id
  } as any;

  if(login){
    where.githubLogin = login
  }

  const pr = await models.pullRequest.findOne({where, raw: true});
  
  if(pr){
    const repoInfo = await models.repositories.findOne({where: {id: find.repository_id}, raw: true});
    const [owner, repo] = repoInfo.githubPath.split(`/`);

    const octoKit = new Octokit({auth: process.env.NEXT_GITHUB_TOKEN});
    const {data} = await octoKit.rest.pulls.get({
      owner,
      repo,
      pull_number: pr.githubId,
    });
    pr.isMergeable = data.mergeable;
    pr.state = data.state;
  }

  return res.status(200).json(pr)
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {repoId: repository_id, githubId, title, description: body, username} = req.body;

  const issue = await models.issue.findOne({where: {githubId, repository_id,},});
  const repoInfo = await models.repositories.findOne({where: {id: repository_id}, raw: true});

  const [owner, repo] = repoInfo.githubPath.split(`/`);

  const octoKit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

  const options = {
    accept: 'application/vnd.github.v3+json',
    owner, repo, title, body,
    head: `${username}:${process.env.NEXT_GITHUB_MAINBRANCH}`,
    base: process.env.NEXT_GITHUB_MAINBRANCH,
    maintainer_can_modify: false,
    draft: false
  }

  try {
    const created = await octoKit.rest.pulls.create(options);

    await models.pullRequest.create({issueId: issue.id, githubId: created.data?.number, githubLogin: username});

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

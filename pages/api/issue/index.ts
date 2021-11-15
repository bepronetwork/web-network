import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {title, description: body, amount, repository_id, creatorAddress, creatorGithub,} = req.body;

  if(!creatorGithub)
    return res.status(422).json(`creatorGithub is required`);

  const repository = await models.repositories.findOne({where: {id: req.body.repository_id}});
  if (!repository)
    return res.status(422).json(`repository not found`)

  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});
  console.log(process.env.NEXT_GITHUB_TOKEN)
  const [owner, repo] = repository.githubPath.split(`/`);

  const githubId = req.body.githubIssueId || (await octokit.rest.issues.create({owner,repo, title, body, labels: ['draft']}))?.data?.number?.toString()

  if (await models.issue.findOne({where: {githubId}}))
    return res.status(409).json(`issueId already exists on database`);

  await models.issue.create({
                              // issueId: `${repository_id}/${githubId}`,
                              githubId,
                              repository_id,
                              creatorAddress,
                              creatorGithub,
                              amount,
                              state: 'pending',
                            });

  return res.json(githubId);
}

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const {repoId: repository_id, githubId, scId: issueId} = req.body;

  return models.issue.update({issueId, state: `draft`}, {where: {githubId: githubId, repository_id, issueId: null}})
               .then(result => {
                 if (!result[0])
                   return res.status(422).json(`nok`)

                 return res.status(200).json(`ok`)
               })
               .catch(_ => res.status(422).json(`nok`));
}

export default async function Issue(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    case 'patch':
      await patch(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

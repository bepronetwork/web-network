import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId]} = req.query;
  const issueId = [repoId, ghId].join(`/`);

  const include = [
    { association: 'developers' },
    { association: 'pullRequests' },
    { association: 'mergeProposals' },
    { association: 'repository' }
  ]

  const issue = await models.issue.findOne({
    where: {issueId},
    include
    // raw: true
  })
  if (!issue)
    return res.status(404).json(null);

  // await composeIssues([issue]);

  return res.status(200).json(issue);
}

async function put(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId]} = req.query;
  const issueId = [repoId, ghId].join(`/`);

  const {seoImage} = req.body;
  var updateObj = {}

  if(seoImage) updateObj = {...updateObj, seoImage}

  const issue = await models.issue.findOne({where: {issueId}})

  if (!issue)
    return res.status(404).json('issue not found');

  await issue.update({...updateObj})
  await issue.save()

  return res.status(200).json(issue);
}

export default async function GetIssues(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    case 'put':
      await put(req, res)
      break

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

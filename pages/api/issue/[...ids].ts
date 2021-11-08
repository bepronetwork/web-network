import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {composeIssues} from '@db/middlewares/compose-issues';
import {Octokit} from 'octokit';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId]} = req.query;
  const issueId = [repoId, ghId].join(`/`);

  const issue = await models.issue.findOne({where:{issueId}, raw: true})

  if (!issue)
    return res.status(404).json(null);

  await composeIssues([issue]);

  return res.status(200).json(issue);
}

export default async function GetIssues(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

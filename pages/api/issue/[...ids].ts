import models from '@db/models';
import api from '@services/api';
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
  })
  
  if (!issue)
    return res.status(404).json(null);
  
  // Update PullRequest Status
  if(!issue.merged){
    for(const pr of issue.pullRequests) {
      if(!pr.merged) await api.patch(`/pull-request/${pr?.githubId}`)
    } 
  }

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

import {NextApiRequest, NextApiResponse} from 'next';
import {subDays} from 'date-fns';
import {Op} from 'sequelize';
import models from '@db/models';
import {Octokit} from 'octokit';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const where = {
    createdAt: {[Op.lt]: subDays(+new Date(), 3),},
    state: 'draft',
  };

  const issues = await models.issue.findAll({where});
  const octokit = new Octokit({auth: process.env.NEXT_GITHUB_TOKEN});

  for (const issue of issues) {
    try {
      const repoInfo = await models.repositories.findOne({where: {id: issue.repository_id}})
      const [owner, repo] = repoInfo.githubPath.split(`/`);
      await octokit.rest.issues.removeLabel({owner, repo, issue_number: issue.githubId, name: 'draft'});
    } catch (error) {
      // label not exists, ignoring
    }
    issue.state = 'open';
    console.log(`Moved ${issue.issueId} to open`);
    await issue.save();
  }

  return res.status(200).json(issues.length);
}

export default async function MoveToOpen(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }
}

import {NextApiRequest, NextApiResponse} from 'next';
import {subMilliseconds} from 'date-fns';
import {Op} from 'sequelize';
import models from '@db/models';
import {Octokit} from 'octokit';
import networkBeproJs from '@helpers/api/handle-network-bepro';
import api from 'services/api'
async function post(req: NextApiRequest, res: NextApiResponse) {

  const network = networkBeproJs({ test: true });

  await network.start();
  const redeemTime = (await network.params.contract.getContract().methods.redeemTime().call()) * 1000;

  const where = {
    createdAt: {[Op.lt]: subMilliseconds(+new Date(), redeemTime),},
    state: 'draft',
  };

  const issues = await models.issue.findAll({where});
  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

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
    await api.post(`/seo/${issue.issueId}`)
  }

  return res.status(200).json(issues);
}

export default async function MoveToOpen(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';
import {Op} from 'sequelize';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {id: [repoId, networkName]} = req.query;

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  })

  if (!network) return res.status(404).json('Invalid network')

  const repository = await models.repositories.findOne({
    where: {id: repoId, network_id: network.id},
  })

  if (!repository)
    return res.status(404).json(null);

  const [owner, repo] = repository.githubPath.split('/')

  const octoKit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN })
  
  const {data} = await octoKit.rest.repos.listBranches({
    repo,
    owner
  })
  
  const listBranchs = data.map(branch => ({
    branch: branch?.name,
    protected: branch?.protected
  }))

  return res.status(200).json(listBranchs);
}

export default async function GetBranchs(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

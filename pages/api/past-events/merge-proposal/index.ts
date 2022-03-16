import {NextApiRequest, NextApiResponse} from 'next';
import models from '@db/models';
import readMergeProposalCreated from '@helpers/api/read-merge-proposal-created';
import networkBeproJs from '@helpers/api/handle-network-bepro';
import { Op } from 'sequelize'

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id, pullRequestId: githubId, networkName} = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  })

  if (!customNetwork) return res.status(404).json('Invalid network')
  if (customNetwork.isClosed) return res.status(404).json('Invalid network')

  const network = networkBeproJs({ test: true, contractAddress: customNetwork.networkAddress });

  await network.start();

  await network.getMergeProposalCreatedEvents({fromBlock, toBlock: +fromBlock+1, filter: {id},})
  // await contract.getPastEvents(`MergeProposalCreated`, {fromBlock, toBlock: +fromBlock+1,})
                .then(events => {readMergeProposalCreated(events, {network, models, res, githubId, networkId: customNetwork.id})})
                .catch(error => {
                  console.log(`Error reading MergeProposalCreated`, error);
                  res.status(400);
                });
}

export default async function ParseMergeCreateProposal(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

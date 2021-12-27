import {NextApiRequest, NextApiResponse} from 'next';
import models from '@db/models';
import readMergeProposalCreated from '@helpers/api/read-merge-proposal-created';
import networkBeproJs from '@helpers/api/handle-network-bepro';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id, pullRequestId: githubId} = req.body;

  const network = networkBeproJs({ test: true });

  await network.start();
  const contract = network.getWeb3Contract();

  await contract.getPastEvents(`MergeProposalCreated`, {fromBlock, toBlock: +fromBlock+1, filter: {id},})
  // await contract.getPastEvents(`MergeProposalCreated`, {fromBlock, toBlock: +fromBlock+1,})
                .then(events => readMergeProposalCreated(events, {network, models, res, githubId}))
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

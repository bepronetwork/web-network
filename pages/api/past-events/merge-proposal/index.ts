import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../../env';
import {Network} from 'bepro-js';
import models from '@db/models';
import readMergeProposalCreated from '@helpers/api/read-merge-proposal-created';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id, pullRequestId: githubId} = req.body;

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

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

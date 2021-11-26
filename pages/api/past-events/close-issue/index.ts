import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../../env';
import {Network} from 'bepro-js';
import {Octokit} from 'octokit';
import {Bus} from '@helpers/bus';
import readCloseIssues from '@helpers/api/read-close-issues';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id} = req.body;
  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

  await network.start();
  const contract = network.getWeb3Contract();

  await contract.getPastEvents(`CloseIssue`, {fromBlock, toBlock: +fromBlock+1, filter: {id},})
                .then(events => readCloseIssues(events, {network, models, octokit, res}))
                .catch(error => {
                  console.log(`Error reading CloseIssue`, error);
                  return res.status(400);
                });
}

export default async function ParseCloseIssue(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

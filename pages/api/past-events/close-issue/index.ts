import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';
import readCloseIssues from '@helpers/api/read-close-issues';
import networkBeproJs from '@helpers/api/handle-network-bepro';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id} = req.body;
  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

  const network = networkBeproJs({ test: true });

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

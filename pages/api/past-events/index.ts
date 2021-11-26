import models from '@db/models';
import {Network} from 'bepro-js';
import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../env';
import {Octokit} from 'octokit';
import readCloseIssues from '@helpers/api/read-close-issues';
import readRedeemIssue from '@helpers/api/read-redeem-issue';

const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

async function get(req: NextApiRequest, res: NextApiResponse) {
  const bulk = await models.chainEvents.findOne({where: {name: `Bulk`}});
  const fromBlock = bulk?.dataValues?.lastBlock || 1731488;

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

  await network.start();
  const contract = network.getWeb3Contract();
  const web3 = network.web3Connection.web3;
  const lastBlock = await web3.eth.getBlockNumber();

  const PER_PAGE = 1500;
  const pages = Math.ceil((lastBlock - fromBlock) / PER_PAGE);

  let start = +fromBlock;
  let end = 0;
  for (let page = 1; page <= pages; page++) {
    const nextEnd = start + PER_PAGE;
    end = nextEnd > lastBlock ? lastBlock : nextEnd;

    console.log(`Reading from ${start} to ${end}; page: ${page} of ${pages}`);
    await contract.getPastEvents(`RedeemIssue`, {fromBlock: start, toBlock: end})
                  .then(events => readRedeemIssue(events, {network, models, res, octokit}))
                  .catch(error => {
                    console.log(`Error reading RedeemIssue`, error);
                  });

    await contract.getPastEvents(`CloseIssue`, {fromBlock: start, toBlock: end})
                  .then(events => readCloseIssues(events, {network, models, res, octokit}))
                  .catch(error => {
                    console.log(`Error reading CloseIssue`, error);
                  });

    start+=PER_PAGE;
    bulk.lastBlock = +end;
    await bulk.save();
  }

  return res.status(200).json(end);
}

export default async function PastEvents(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

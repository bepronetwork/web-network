import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';
import readCloseIssues from '@helpers/api/read-close-issues';
import readRedeemIssue from '@helpers/api/read-redeem-issue';
import networkBeproJs from '@helpers/api/handle-network-bepro';
import { Op } from 'sequelize'

const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});

async function get(req: NextApiRequest, res: NextApiResponse) {
  const bulk = await models.chainEvents.findOne({where: {name: `Bulk`}});
  const fromBlock = bulk?.dataValues?.lastBlock || 1731488;
  const customNetworks = await models.network.findAll({
    where: {
      name: {
        [Op.notILike]: `%${process.env.NEXT_PUBLIC_BEPRO_NETWORK_NAME}%`
      }
    }
  })

  var end = 0

  const networks = Array({
    id: 1,
    name: process.env.NEXT_PUBLIC_BEPRO_NETWORK_NAME, 
    networkAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  }, ...customNetworks)

  for (const customNetwork of networks) {
    if (!customNetwork.networkAddress) return
    
    let start = +fromBlock
    let cEnd = 0

    console.log(`Reading past events of ${customNetwork.name} - ${customNetwork.networkAddress}`)
    const network = networkBeproJs({ contractAddress: customNetwork.networkAddress });

    await network.start();
    const web3 = network.web3;
    const lastBlock = await web3.eth.getBlockNumber();

    const PER_PAGE = 1500;
    const pages = Math.ceil((lastBlock - fromBlock) / PER_PAGE);

    for (let page = 1; page <= pages; page++) {
      const nextEnd = start + PER_PAGE;
      if (end === 0) end = lastBlock
      cEnd = nextEnd > lastBlock ? lastBlock : nextEnd

      console.log(`[${customNetwork.name}] Reading from ${start} to ${cEnd}; page: ${page} of ${pages}`);
      await network.getRedeemIssueEvents({fromBlock: start, toBlock: cEnd})
                    .then(events => readRedeemIssue(events, {network, models, res, octokit, customNetworkId: customNetwork.id}))
                    .catch(error => {
                      console.log(`Error reading RedeemIssue`, error);
                    });

      await network.getCloseIssueEvents({fromBlock: start, toBlock: cEnd})
                    .then(events => readCloseIssues(events, {network, models, res, octokit, customNetworkId: customNetwork.id}))
                    .catch(error => {
                      console.log(`Error reading CloseIssue`, error);
                    });

      start+=PER_PAGE;

    }

    start = +fromBlock
  }

  if (end > 0) {
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

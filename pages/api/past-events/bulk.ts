import { Network_v2 } from "@taikai/dappkit";
import {NextApiRequest, NextApiResponse} from 'next';
import getConfig from 'next/config';
import { Op } from 'sequelize'

import models from 'db/models';

import { BountyHelpers } from "helpers/api/bounty";
import networkBeproJs from 'helpers/api/handle-network-bepro';
import { ProposalHelpers } from "helpers/api/proposal";
import { PullRequestHelpers } from "helpers/api/pull-request";

const { publicRuntimeConfig } = getConfig();

const handler = async (type, helpers, network, customNetwork, fromBlock, toBlock) => {
  const [contractMethod, apiMethod] = helpers[type];

  const events = network[contractMethod]({ fromBlock,  toBlock });

  const results = await apiMethod(events, network, customNetwork);

  return results;
};

async function post(req: NextApiRequest, res: NextApiResponse) {
  const bulk = await models.chainEvents.findOne({where: {name: `Bulk`}});
  const fromBlock = bulk?.dataValues?.lastBlock || 1731488;
  const customNetworks = await models.network.findAll({
    where: {
      name: {
        [Op.notILike]: `%${publicRuntimeConfig.networkConfig.networkName}%`
      }
    }
  })

  let end = 0

  const networks = [{
    id: 1,
    name: publicRuntimeConfig.networkConfig.networkName, 
    networkAddress: publicRuntimeConfig.contract.address
  }, ...customNetworks]

  for (const customNetwork of networks) {
    if (!customNetwork.networkAddress) return
    
    let start = +fromBlock
    let cEnd = 0

    console.log(`Reading past events of ${customNetwork.name} - ${customNetwork.networkAddress}`)
    const network = networkBeproJs({ contractAddress: customNetwork.networkAddress, version: 2 }) as Network_v2;

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

      const bountyEventsTypes = Object.keys(BountyHelpers);
      const proposalEventsTypes = Object.keys(ProposalHelpers);
      const pullRequestEventsTypes = Object.keys(PullRequestHelpers);

      await Promise.all([
        ...bountyEventsTypes.map(type => handler(type, BountyHelpers, network, customNetwork, start, cEnd)),
        ...proposalEventsTypes.map(type => handler(type, ProposalHelpers, network, customNetwork, start, cEnd)),
        ...pullRequestEventsTypes.map(type => handler(type, PullRequestHelpers, network, customNetwork, start, cEnd))
      ]);

      start += PER_PAGE;
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
  case 'post':
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
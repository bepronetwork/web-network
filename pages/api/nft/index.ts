import { ProposalDetail } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

import models from "db/models";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { Settings } from "helpers/settings";

import DAO from "services/dao-service";
import ipfsService from "services/ipfs-service";
import { error as LogError } from "services/logging";

async function post(req: NextApiRequest, res: NextApiResponse) {
  try{
    // eslint-disable-next-line max-len
    const {issueContractId, proposalscMergeId, networkName} = req.body as {issueContractId: number, proposalscMergeId: number, networkName: string};
  
    if(!networkName || proposalscMergeId < 0 || issueContractId < 0)
      return res.status(400).json("Missing parameters");
  
    const settings = await models.settings.findAll({
    where: { 
      visibility: "public",
      group: "urls"
    },
    raw: true,
    });

    const defaultConfig = (new Settings(settings)).raw();
  
    if (!defaultConfig?.urls?.ipfs)
      return res.status(500).json("Missing ipfs url on settings");

    const customNetwork = await models.network.findOne({
        where: {
          name: {
            [Op.iLike]: String(networkName)
          }
        }
    });
      
    if(!customNetwork)
      return res.status(404).json('Network not founded');

    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: defaultConfig.urls.web3Provider,
    });

    if (!await DAOService.start()) return res.status(500).json("Failed to connect with chain");
    if(!await DAOService.loadNetwork(customNetwork.networkAddress)) 
      return res.status(500).json("network could not be loaded");

    const network = DAOService.network;

    await network.start();

    const networkBounty = await network.getBounty(issueContractId);
    if (!networkBounty) return res.status(404).json("Bounty invalid");

    if(networkBounty.canceled || networkBounty.closed)
      return res.status(404).json("Bounty has been closed or canceled");

    const proposal = networkBounty.proposals.find(p=> p.id === +proposalscMergeId)
    
    if(!proposal)
      return res.status(404).json("Proposal invalid");

    if(proposal.refusedByBountyOwner || await network.isProposalDisputed(issueContractId, proposalscMergeId))
      return res.status(404).json("proposal cannot be accepted");

    const pullRequest = networkBounty.pullRequests.find(pr=> pr.id === proposal.prId)

    if(pullRequest.canceled || !pullRequest.ready)
      return res.status(404).json("PR cannot be accepted");

    const [{treasury}, creatorFee, proposerFee] = await Promise.all([DAOService?.getTreasury(),
                                                                     DAOService?.getMergeCreatorFee(),
                                                                     DAOService?.getProposerFee()
    ])
    
    const distributions = calculateDistributedAmounts(treasury, 
                                                      creatorFee, 
                                                      proposerFee,
                                                      BigNumber(networkBounty.tokenAmount), 
                                                      proposal.details.map(({ percentage }) => percentage));

    const participants = await Promise.all(proposal.details.map(async(detail: ProposalDetail, i) => {
      if(!detail.recipient) return;

      const user = await models.user.findOne({
        where: { address: {
        [Op.iLike]: String(detail.recipient)
        } }});

      return { 
        githubHandle: user?.githubHandle || '', 
        percentage: distributions.proposals[i].percentage, 
        address: detail.recipient, 
        distributedAmount: distributions.proposals[i].value,
      };
    }))
    
    const nft = {
      price: networkBounty.tokenAmount,
      participants,
      repository: networkBounty.repoPath,
      githubId: networkBounty?.cid.split("/")[1],
      githubPullRequestId: pullRequest.cid.toString(),
    }
    const { hash } = await ipfsService.add(nft, true);

    if(!hash) return res.status(500);

    const url = `${defaultConfig.urls.ipfs}/${hash}`;
 
    return res.status(200).json({url});
  }
  catch(error){
    LogError(error)
    return res.status(500).send(error);
  }
}

async function NftMethods(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(NftMethods);
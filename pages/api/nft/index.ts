import {Bounty, ProposalDetail,} from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import {RouteMiddleware} from "middleware";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {formatNumberToNScale} from "helpers/formatNumber";
import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import {Settings} from "helpers/settings";

import DAO from "services/dao-service";
import ipfsService from "services/ipfs-service";
import {error as LogError} from "services/logging";

interface NftPayload { 
  issueContractId: number;
  proposalContractId: number;
  networkName: string;
  mergerAddress: string;
}

const NftParticipant = (githubHandle, percentage, address, distributedAmount) => ({
  githubHandle,
  percentage,
  address,
  distributedAmount
});

async function post(req: NextApiRequest, res: NextApiResponse) {
  try{
    const {
      issueContractId,
      proposalContractId,
      mergerAddress,
      networkName
    } = req.body as NftPayload;
    
    if(!networkName || proposalContractId < 0 || issueContractId < 0)
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
            [Op.iLike]: String(networkName).replaceAll(" ", "-")
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

    const networkBounty = await network.getBounty(issueContractId) as Bounty;
    if (!networkBounty) return res.status(404).json("Bounty invalid");

    if(networkBounty.canceled || networkBounty.closed)
      return res.status(404).json("Bounty has been closed or canceled");

    const proposal = networkBounty.proposals.find(p=> p.id === +proposalContractId)
    
    if(!proposal)
      return res.status(404).json("Proposal invalid");

    if(proposal.refusedByBountyOwner || await network.isProposalDisputed(+issueContractId, +proposalContractId))
      return res.status(404).json("proposal cannot be accepted");

    const pullRequest = networkBounty.pullRequests.find(pr=> pr.id === proposal.prId)

    if(pullRequest.canceled || !pullRequest.ready)
      return res.status(404).json("PR cannot be accepted");

    const issue = await models.issue.findOne({
      where: {
        issueId: networkBounty?.cid,
        network_id: customNetwork?.id
      },
      include: [
        { association: "repository" }
      ]
    });

    const [{treasury}, creatorFee, proposerFee] = await Promise.all([DAOService?.getTreasury(),
                                                                     DAOService?.getMergeCreatorFee(),
                                                                     DAOService?.getProposerFee()
    ])

    const distributions = calculateDistributedAmounts(treasury,
                                                      creatorFee,
                                                      proposerFee,
                                                      BigNumber(networkBounty.tokenAmount),
                                                      proposal.details);

    if (!mergerAddress)
      return res.status(404).json("Merger address not found");

    const getNftParticipant = async (address, amounts) => {
      const user = await models.user.findOne({ where: { address: { [Op.iLike]: String(address) } } });

      return NftParticipant(user?.githubHandle || '', amounts.percentage, address, amounts.value);
    }

    const merger = await getNftParticipant(mergerAddress, distributions.mergerAmount);

    const participants = await Promise.all(proposal.details.map(async(detail: ProposalDetail, i) => {
      if(!detail.recipient) return;

      return getNftParticipant(detail.recipient, distributions.proposals[i]);
    }));

    const nft = {
      title: `${networkBounty.title}`,
      description: `NFT for bounty ${issue.githubId} created on network ${customNetwork.name}`,
      image: issue.seoImage? `${defaultConfig.urls.ipfs}/${issue.seoImage}`: "",
      properties: {
        price: formatNumberToNScale(networkBounty.tokenAmount),
        merger,
        participants,
        fees: BigNumber(distributions.mergerAmount.value)
                        .plus(BigNumber(distributions.proposerAmount.value)
                        .plus(BigNumber(distributions.treasuryAmount.value))).toString(),
        repository: issue?.repository?.githubPath,
        githubId: networkBounty?.cid.split("/")[1],
        githubPullRequestId: pullRequest.cid.toString(),
      }
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

export default RouteMiddleware(NftMethods);
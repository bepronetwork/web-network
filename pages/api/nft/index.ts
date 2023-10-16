import {Bounty, ProposalDetail,} from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import {chainFromHeader} from "helpers/chain-from-header";
import {formatNumberToNScale} from "helpers/formatNumber";
import {resJsonMessage} from "helpers/res-json-message";
import {Settings} from "helpers/settings";

import { withProtected } from "middleware";
import {WithValidChainId} from "middleware/with-valid-chain-id";

import DAO from "services/dao-service";
import ipfsService from "services/ipfs-service";
import {error as LogError} from "services/logging";

interface NftPayload { 
  issueContractId: number;
  proposalContractId: number;
  networkName: string;
  mergerAddress: string;
}

const NftParticipant = (handle, percentage, address, distributedAmount) => ({
  handle,
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

    const missingParams = [
      [networkName, 'Missing network name'],
      [proposalContractId, 'Missing proposal contract id'],
      [issueContractId, 'Missing bounty contract Id']
    ].filter(([v,]) => !["string", "number"].includes(typeof v)).map(([,m]) => m as string);

    if (missingParams.length)
      return resJsonMessage(missingParams, res, 400);
    
    const settings = await models.settings.findAll({where: {visibility: "public", group: "urls"}, raw: true,});
    const defaultConfig = (new Settings(settings)).raw();

    if (!defaultConfig?.urls?.ipfs)
      return res.status(500).json("Missing ipfs url on settings");

    const chain = await chainFromHeader(req);

    const customNetwork = await models.network.findOne({
        where: {
          name: {
            [Op.iLike]: String(networkName).replaceAll(" ", "-")
          },
          chain_id: { [Op.eq]: +chain?.chainId }
        }
    });
    
    if(!customNetwork)
      return res.status(404).json('Network not founded');

    const DAOService = new DAO({ 
      skipWindowAssignment: true,
      web3Host: chain?.chainRpc,
    });

    if (!await DAOService.start())
      return resJsonMessage(`Failed to connect to chainRpc ${chain?.chainRpc} for id ${chain?.chainId}`, res, 500);

    const { networkAddress } = customNetwork;

    if(!await DAOService.loadNetwork(networkAddress))
      return resJsonMessage(`Failed to load networks on chainRpc ${chain?.chainRpc} for address ${networkAddress}`, 
                            res,
                            500);

    const network = DAOService.network;

    await network.start();

    const networkBounty = await network.getBounty(issueContractId) as Bounty;
    if (!networkBounty) return resJsonMessage("Bounty invalid", res, 404);

    if(networkBounty.canceled || networkBounty.closed)
      return resJsonMessage("Bounty has been closed or canceled", res, 404);

    const proposal = networkBounty.proposals.find(p=> p.id === +proposalContractId)
    
    if(!proposal)
      return resJsonMessage("Proposal invalid", res, 404);

    if(proposal.refusedByBountyOwner || await network.isProposalDisputed(+issueContractId, +proposalContractId))
      return resJsonMessage("proposal cannot be accepted", res, 404);

    const pullRequest = networkBounty.pullRequests.find(pr=> pr.id === proposal.prId)

    if(pullRequest.canceled || !pullRequest.ready)
      return resJsonMessage("PR cannot be accepted", res, 404);

    const issue = await models.issue.findOne({
      where: {
        contractId: +networkBounty?.id,
        network_id: customNetwork?.id
      }
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

      return NftParticipant(user?.githubLogin || '', amounts.percentage, address, amounts.value);
    }

    const merger = await getNftParticipant(mergerAddress, distributions.mergerAmount);

    const participants = await Promise.all(proposal.details.map(async(detail: ProposalDetail, i) => {
      if(!detail.recipient) return;

      return getNftParticipant(detail.recipient, distributions.proposals[i]);
    }));

    const nft = {
      title: `${networkBounty.title}`,
      description: `NFT for bounty ${issue.id} created on network ${customNetwork.name}`,
      image: issue.nftImage ? `${defaultConfig.urls.ipfs}/${issue.nftImage}`: "",
      properties: {
        price: formatNumberToNScale(networkBounty.tokenAmount),
        merger,
        participants,
        fees: BigNumber(distributions.mergerAmount.value)
                        .plus(BigNumber(distributions.proposerAmount.value)
                        .plus(BigNumber(distributions.treasuryAmount.value))).toString(),
        bountyId: networkBounty.id,
        githubPullRequestId: pullRequest.cid.toString(),
      }
    }

    const { hash } = await ipfsService.add(nft, true);

    if (!hash) return resJsonMessage('no hash found', res, 400);

    const url = `${defaultConfig.urls.ipfs}/${hash}`;
 
    return res.status(200).json({url});
  }
  catch(error){
    LogError(`Failed to POST nft`, {error: error?.toString()})
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

export default withProtected(WithValidChainId(NftMethods));

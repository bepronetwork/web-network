import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

import { Settings } from "helpers/settings";

import ipfsService from "services/ipfs-service";

async function post(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line max-len
  const {issueId, proposalscMergeId, rewardAmount} = req.body as {issueId: string, proposalscMergeId: number, rewardAmount: number};
  
  if(!rewardAmount||proposalscMergeId < 0||!issueId)
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

  const include = [
    { association: "pullRequests" },
    { association: "mergeProposals", where:{ contractId: +proposalscMergeId } },
    { association: "repository" },
  ];


  const issue = await models.issue.findOne({
    where: {
      issueId,
    },
    include
  });

  if (!issue) return res.status(404).json('Issue not founded');

  const proposal = issue.mergeProposals[0];
  const pullRequest = issue.pullRequests.find((pr)=> pr.id === proposal.pullRequestId);
  const user = await models.user.findOne({where: { githubLogin: pullRequest?.githubLogin }});

  const nft = {
    price: issue?.amount,
    reward: rewardAmount,
    githubHandle: user?.githubHandle,
    repository: issue?.repository?.githubPath,
    githubId: issue?.githubId,
    githubPullRequestId: pullRequest.githubId
  }
  const { hash } = await ipfsService.add(nft, true);

  if(!hash) return res.status(500);

  const url = `${defaultConfig.urls.ipfs}/${hash}`;
  
 
  return res.status(200).json({url});
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
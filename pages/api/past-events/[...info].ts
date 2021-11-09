import models from '@db/models';
import {Network} from 'bepro-js';
import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../env';
import {Octokit} from 'octokit';
import { Bus } from '@helpers/bus';

const octokit = new Octokit({auth: process.env.NEXT_GITHUB_TOKEN});
// last 1731488
async function get(req: NextApiRequest, res: NextApiResponse) {
  const {info: [fromBlock,]} = req.query;

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

  await network.start();
  const contract = network.getWeb3Contract();
  const web3 = network.web3Connection.web3;
  const lastBlock = await web3.eth.getBlockNumber();

  const PER_PAGE = 1500;
  const pages = Math.ceil(lastBlock / PER_PAGE);

  let start = +fromBlock;
  for (let page = 1; page <= pages; page++) {
    let end = start + PER_PAGE;
    console.log(`Reading from ${start} to ${end}; page: ${page} of ${pages}`);
    await contract.getPastEvents(`RedeemIssue`, {fromBlock: start, toBlock: end})
                  .then(async function redeemIssues(events) {
                    for (const event of events) {
                      const eventData = event.returnValues;
                      const issueId = await network.getIssueById({issueId: eventData.id}).then(({cid}) => cid);
                      const issue = await models.issue.findOne({where: {issueId,}});

                      if (!issue)
                        return console.log(`Failed to find an issue to redeem`, event);

                      const repoInfo = await models.repositories.findOne({where: {id: issue?.repository_id}})
                      const [owner, repo] = repoInfo.githubPath.split(`/`);
                      await octokit.rest.issues.update({owner, repo, issue_number: issueId, state: 'closed',});
                      issue.state = 'canceled';
                      await issue.save();
                    }
                  })
                  .catch(error => {
                    console.log(`Error reading RedeemIssue`, error);
                  });

    await contract.getPastEvents(`CloseIssue`, {fromBlock: start, toBlock: end})
                  .then(async function readCloseIssues(events) {
                    for (const event of events) {
                      const eventData = event.returnValues;
                      // Merge PR and close issue on github
                      const issueId = await network.getIssueById({issueId: eventData.id}).then(({cid}) => cid);
                      const issue = await models.issue.findOne({where: {issueId,}, include: ['mergeProposals'],});

                      if (!issue)
                        return console.log(`Failed to find an issue to close`, event);

                      const mergeProposal = issue.mergeProposals.find((mp) => mp.scMergeId = eventData.mergeID);

                      const pullRequest = await mergeProposal.getPullRequest();

                      const repoInfo = await models.repositories.findOne({where: {id: issue?.repository_id}})
                      const [owner, repo] = repoInfo.githubPath.split(`/`);
                      await octokit.rest.pulls.merge({owner, repo, pull_number: pullRequest.githubId})
                      await octokit.rest.issues.update({owner, repo, issue_number: issue.githubId, state: 'closed',});

                      issue.state = 'closed';
                      await issue.save();
                    }
                  })
                  .catch(error => {
                    console.log(`Error reading CloseIssue`, error);
                  });

    await contract.getPastEvents(`MergeProposalCreated`, {fromBlock: start, toBlock: end})
                  .then(async function mergeProposalCreated(events) {
                    for (const event of events) {
                      const {id: scIssueId, mergeID: scMergeId, creator} = event.returnValues;
                      const issueId = await network.getIssueById({issueId: scIssueId}).then(({cid}) => cid);

                      console.log(`IssueId`, issueId);

                      const issue = await models.issue.findOne({where: {issueId,}});
                      if (!issue)
                        return console.log(`Failed to find an issue to add merge proposal`, event);

                      const user = await models.user.findOne({where: {address: creator.toLowerCase()}});
                      if (!user)
                        return console.log(`Could not find a user for ${creator}`, event);

                      const pr = await models.pullRequest.findOne({where: {issueId: issue?.id}});
                      if (!pr)
                        return console.log(`Could not find PR for db-issue ${issue?.id}`, event);

                      const mergeExists = await models.mergeProposal.findOne({where: {scMergeId, issueId: issue?.id, pullRequestId: pr?.id,}})
                      if (mergeExists) {
                        Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`, mergeExists)
                        return console.log(`Event was already parsed. mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
                      }

                      const merge = await models.mergeProposal.create({scMergeId, issueId: issue?.id, pullRequestId: pr?.id,});

                      console.log(`Emitting `, `mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
                      Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`, merge)
                    }
                  })
                  .catch(error => {
                    console.log(`Error reading MergeProposalCreated`, error);
                  });

    start+=PER_PAGE;
  }

  return res.status(204);
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

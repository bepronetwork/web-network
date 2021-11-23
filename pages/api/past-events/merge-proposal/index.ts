import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../../env';
import {Network} from 'bepro-js';
import {Bus} from '@helpers/bus';
import models from '@db/models';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id, pullRequestId} = req.body;

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

  await network.start();
  const contract = network.getWeb3Contract();

  await contract.getPastEvents(`MergeProposalCreated`, {fromBlock, toBlock: +fromBlock+1, filter: {id},})
  // await contract.getPastEvents(`MergeProposalCreated`, {fromBlock, toBlock: +fromBlock+1,})
                .then(async function mergeProposalCreated(events) { // todo: refactor this onto a helper
                  console.log(`Events`, events);
                  for (const event of events) {
                    const {id: scIssueId, mergeID: scMergeId, creator} = event.returnValues;
                    const issueId = await network.getIssueById({issueId: scIssueId}).then(({cid}) => cid);

                    const issue = await models.issue.findOne({where: {issueId,}});
                    if (!issue)
                      return console.log(`Failed to find an issue to add merge proposal`, event);

                    const user = await models.user.findOne({where: {address: creator.toLowerCase()}});
                    if (!user)
                      return console.log(`Could not find a user for ${creator}`, event);

                    const pr = await models.pullRequest.findOne({where: {issueId: issue?.id, githubId: pullRequestId}});
                    if (!pr)
                      return console.log(`Could not find PR for db-issue ${issue?.id}`, event);

                    const mergeExists = await models.mergeProposal.findOne({where: {scMergeId, issueId: issue?.id, pullRequestId: pr?.id,}})
                    if (mergeExists) {
                      Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`, mergeExists)
                      return console.log(`Event was already parsed. mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
                    }

                    const merge = await models.mergeProposal.create({scMergeId, issueId: issue?.id, pullRequestId: pr?.id, githubLogin: user?.githubLogin});

                    console.log(`Emitting `, `mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`);
                    Bus.emit(`mergeProposal:created:${user?.githubLogin}:${scIssueId}:${pr?.githubId}`, merge)
                    res.status(204);
                  }
                })
                .catch(error => {
                  console.log(`Error reading MergeProposalCreated`, error);
                  res.status(400);
                });
}

export default async function ParseMergeCreateProposal(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

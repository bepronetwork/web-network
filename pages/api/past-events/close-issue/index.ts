import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {CONTRACT_ADDRESS, WEB3_CONNECTION} from '../../../../env';
import {Network} from 'bepro-js';
import {Octokit} from 'octokit';
import {Bus} from '@helpers/bus';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {fromBlock, id} = req.body;
  const octokit = new Octokit({auth: process.env.NEXT_GITHUB_TOKEN});

  const opt = {opt: {web3Connection: WEB3_CONNECTION,  privateKey: process.env.NEXT_PRIVATE_KEY}, test: true,};
  const network = new Network({contractAddress: CONTRACT_ADDRESS, ...opt});

  await network.start();
  const contract = network.getWeb3Contract();

  await contract.getPastEvents(`CloseIssue`, {fromBlock, toBlock: +fromBlock+1, filter: {id},})
                .then(async function readCloseIssues(events) {
                  for (const event of events) {
                    const eventData = event.returnValues;
                    // Merge PR and close issue on github
                    const issueId = await network.getIssueById({issueId: eventData.id}).then(({cid}) => cid);
                    const issue = await models.issue.findOne({where: {issueId,}, include: ['mergeProposals'],});

                    if (!issue || issue?.state === `closed`) {
                      console.log(`Emitting closeIssue:created:${issueId}`);
                      Bus.emit(`closeIssue:created:${issueId}`, issue)
                      return console.log(`Failed to find an issue to close or already closed`, event);
                    }

                    const mergeProposal = issue.mergeProposals.find((mp) => mp.scMergeId = eventData.mergeID);

                    const pullRequest = await mergeProposal.getPullRequest();

                    const repoInfo = await models.repositories.findOne({where: {id: issue?.repository_id}})
                    const [owner, repo] = repoInfo.githubPath.split(`/`);
                    await octokit.rest.pulls.merge({owner, repo, pull_number: pullRequest.githubId})
                    await octokit.rest.issues.update({owner, repo, issue_number: issue.githubId, state: 'closed',});

                    issue.state = 'closed';
                    await issue.save();

                    console.log(`Emitting closeIssue:created:${issueId}`);
                    Bus.emit(`closeIssue:created:${issueId}`, issue)
                  }
                  if (events.length)
                    return res.status(200);
                  else return res.status(204);
                })
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

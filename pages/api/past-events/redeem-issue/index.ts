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

  await contract.getPastEvents(`RedeemIssue`, {fromBlock, toBlock: +fromBlock+1, filter: {id},})
                .then(async function redeemIssues(events) {
                  for (const event of events) {
                    const eventData = event.returnValues;
                    const issueId = await network.getIssueById({issueId: eventData.id}).then(({cid}) => cid);
                    const issue = await models.issue.findOne({where: {issueId,}});

                    if (!issue || issue?.state === `canceled`) {
                      console.log(`Emitting redeemIssue:created:${issueId}`);
                      Bus.emit(`redeemIssue:created:${issueId}`, issue)
                      return console.log(`Failed to find an issue to redeem or already redeemed`, event);
                    }

                    const repoInfo = await models.repositories.findOne({where: {id: issue?.repository_id}})
                    const [owner, repo] = repoInfo.githubPath.split(`/`);
                    await octokit.rest.issues.update({owner, repo, issue_number: issueId, state: 'closed',});
                    issue.state = 'canceled';
                    await issue.save();

                    console.log(`Emitting redeemIssue:created:${issueId}`);
                    Bus.emit(`redeemIssue:created:${issueId}`, issue)
                  }
                })
                .catch(error => {
                  console.log(`Error reading RedeemIssue`, error);
                });

}

export default async function ParseRedeemIssue(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}

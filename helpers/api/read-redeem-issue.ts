import {Bus} from '@helpers/bus';
import api from '@services/api';

export default async function readRedeemIssue(events, {network, models, res, octokit}) {
  for (const event of events) {
    const eventData = event.returnValues;
    const issueId = await network.getIssueById(eventData.id).then(({cid}) => cid);
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
    await api.post(`/seo/${issueId}`)
    .catch(e => {
      console.log(`Error creating SEO`, e);
    })

    console.log(`Emitting redeemIssue:created:${issueId}`);
    Bus.emit(`redeemIssue:created:${issueId}`, issue)
    res.status(204);
  }
}

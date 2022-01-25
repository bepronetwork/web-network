import {Bus} from '@helpers/bus';
import {Op} from 'sequelize';

export default async function readCloseIssues(events, {network, models, octokit, res}) {
  for (const event of events) {
    const eventData = event.returnValues;
    // Merge PR and close issue on github
    const issueId = await network.getIssueById({issueId: eventData.id}).then(({cid}) => cid);
    const issue = await models.issue.findOne({where: {issueId,}, include: ['mergeProposals'],});

    if (!issue || issue?.state === `closed`) {
      console.log(`Emitting closeIssue:created:${issueId}`);
      Bus.emit(`closeIssue:created:${issueId}`, issue)
      console.log(`Failed to find an issue to close or already closed`, event);
      return res.status(204);
    }

    const mergeId = issue.mergeProposals.find((mp) => mp.scMergeId == eventData.mergeID);
    const mergeProposal = await models.mergeProposal.findOne({where: {id: mergeId.id,}, include: ['pullrequest'],})

    const pullRequest = mergeProposal.pullrequest;

    const repoInfo = await models.repositories.findOne({where: {id: issue?.repository_id}})
    const [owner, repo] = repoInfo.githubPath.split(`/`);
    await octokit.rest.pulls.merge({owner, repo, pull_number: pullRequest.githubId});
    await octokit.rest.issues.update({owner, repo, issue_number: issue.githubId, state: `closed`,});

    const pullRequests = await models.pullRequest
                                     .findAll({where: {issueId: issue.id, githubId: {[Op.not]: pullRequest.githubId}}, raw: true})

    for (const pr of pullRequests) {
      try {
        await octokit.rest.pulls.update({owner, repo, pull_number: pr.githubId, state: `closed`});
      } catch (e) {
        console.error(`Failed to update pull for ${pr.githubId}`, e)
      }
    }

    issue.merged = mergeProposal.scMergeId;
    issue.state = 'closed';
    await issue.save();

    console.log(`Emitting closeIssue:created:${issueId}`);
    Bus.emit(`closeIssue:created:${issueId}`, issue)
  }
  if (events.length)
    return res.status(200);
  else return res.status(204);
}

import models from "@db/models";

export async function composeIssues(issues) {
  for (const issue of issues) {
    if (!issue?.id)
      return;

    const opts = {raw: true, nest: true, where: {issueId: issue?.id}};

    const developers = await models.developer.findAll(opts);
    const pullRequests = await models.pullRequest.findAll(opts)
    const mergeProposals = await models.mergeProposal.findAll(opts)

    Object.assign(issue, {developers, mergeProposals, pullRequests});
  }
}

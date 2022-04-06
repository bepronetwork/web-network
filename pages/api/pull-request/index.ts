import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import paginate from "helpers/paginate";

import api from "services/api";
import { withCors } from "middleware";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { login, issueId, networkName } = req.query;
  const where = {} as any;

  if (login) where.githubLogin = login;

  if (issueId) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        }
      }
    });

    if (!network) return res.status(404).json("Invalid network");
    if (network.isClosed) return res.status(404).json("Invalid network");

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json("Issue not found");

    where.issueId = issue.id;
  }

  const include = [{ association: "issue" }];

  const prs = await models.pullRequest.findAndCountAll({
    ...paginate({ where }, req.query, [
      [req.query.sortBy || "updatedAt", req.query.order || "DESC"]
    ])
    // include
  });

  if (!issueId)
    for (const pr of prs.rows) {
      pr.issue = await models.issue.findOne({ where: { id: pr.issueId } });
    }

  return res.status(200).json(prs);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    repoId: repository_id,
    githubId,
    title,
    description: body,
    username,
    branch
  } = req.body;

  const issue = await models.issue.findOne({
    where: { githubId, repository_id }
  });

  if (!issue) return res.status(404);

  const repoInfo = await models.repositories.findOne({
    where: { id: repository_id },
    raw: true
  });

  const [owner, repo] = repoInfo.githubPath.split("/");

  const octoKit = new Octokit({ auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN });

  const options = {
    accept: "application/vnd.github.v3+json",
    owner,
    repo,
    title,
    body,
    head: `${username}:${branch}`,
    base: issue.branch || process.env.NEXT_GITHUB_MAINBRANCH,
    maintainer_can_modify: false,
    draft: false
  };

  try {
    const created = await octoKit.rest.pulls.create(options);

    await models.pullRequest.create({
      issueId: issue.id,
      githubId: created.data?.number,
      githubLogin: username,
      branch
    });

    issue.state = "ready";

    const issueLink = `${process.env.NEXT_PUBLIC_HOME_URL}/bounty?id=${issue?.githubId}&repoId=${issue?.repository_id}`;
    const body = `@${issue.creatorGithub}, @${username} has a solution - [check your bounty](${issueLink})`;
    await octoKit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issue.githubId,
      body
    });

    await issue.save();
    /*twitterTweet({
      type: 'bounty',
      action: 'solution',
      username: username,
      issue
    })*/
    await api.post(`/seo/${issue?.issueId}`).catch((e) => {
      console.log("Error creating SEO", e);
    });

    return res.json("ok");
  } catch (error) {
    return res.status(error.response.status).json(error.response.data);
  }
}

async function PullRequest(req: NextApiRequest,
                                          res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default  withCors(PullRequest)
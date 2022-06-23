import withCors from 'middleware/withCors';
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import getConfig from "next/config";

import { CustomSession } from 'interfaces/custom-session';

import Github from 'services/github';

const { serverRuntimeConfig: { github: { token: botToken } } } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const [owner, repo, pullRequestId] = req.query.params;
  const session = await getSession({ req }) as CustomSession;

  const github = new Github(session?.user?.accessToken || botToken);

  const participants = await github.getPullRequestParticipants(`${owner}/${repo}`, +pullRequestId);

  return res.status(200).json(participants);
}

async function GithubPullRequest(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(GithubPullRequest);
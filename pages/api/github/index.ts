import { GithubActions } from "@interfaces/enums/github-actions";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { Octokit } from "octokit";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET;
const BOT_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { action, params } = req.body;

  try {
    const token = await getToken({ req, secret: AUTH_SECRET });

    const octokit = new Octokit({
      auth: token?.access_token || BOT_TOKEN
    });

    let response = undefined;

    switch (action) {
      case GithubActions.PullRequestCommits:
        response = await octokit.paginate(octokit.rest.pulls.listCommits, { ...params });
      break;

      case GithubActions.RepositoryForks:
          response = await octokit.rest.repos.listForks({ ...params, per_page: 100 });
      break;

      case GithubActions.UserRepositories:
          response = await octokit.rest.repos.get({ ...params });
      break;

      case GithubActions.PullRequestOrIssueComments:
          response = await octokit.rest.issues.listComments({ ...params });
      break;

      case GithubActions.Commit:
          response = await octokit.rest.repos.getCommit({ ...params });
      break;

      case GithubActions.Issue:
          response = await octokit.rest.issues.get({ ...params });
      break;

      case GithubActions.PullRequest:
          response = await octokit.rest.pulls.get({ ...params });
      break;

      case GithubActions.RepositoryBranches:
          response = await octokit.rest.repos.listBranches({ ...params });
      break;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.log("Github Endpoint", { req, error }); 

    return res.status(500).json(error);
  }
}

export default async function Github(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}

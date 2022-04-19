import { useEffect, useState } from "react";

import { Octokit } from "octokit";

import { useAuthentication } from "contexts/authentication";

export default function useOctokit() {
  const { user } = useAuthentication();
  const [octokit, setOctokit] = useState<Octokit>(new Octokit());
  const [authenticated, setAuthenticaded] = useState(false);

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    return { owner, repo };
  }

  async function getStargazers(path: string) {
    if (!authenticated) return { forks: 0, stars: 0 };

    const forks = await octokit.paginate(octokit.rest.repos.listForks, {
      ...getOwnerRepoFrom(path)
    });

    const stars = await octokit.paginate(octokit.rest.activity.listStargazersForRepo, {
      ...getOwnerRepoFrom(path)
    });

    const toLen = (array) =>
      array.length > 99 ? "+99" : array.length.toString();

    return { forks: toLen(forks), stars: toLen(stars) };
  }

  async function getCommitsOfPr(pull_number: number, path: string) {
    return octokit.paginate(octokit.rest.pulls.listCommits, {
      ...getOwnerRepoFrom(path),
      pull_number
    });
  }

  async function getForksOf(path: string) {
    return octokit.paginate(octokit.rest.repos.listForks, {
      ...getOwnerRepoFrom(path)
    });
  }

  async function getUserRepos(githubLogin: string, repoName: string) {
    return octokit.rest.repos.get({ owner: githubLogin, repo: repoName });
  }

  async function listUserRepos(githubLogin: string) {
    return octokit.rest.search.repos({
      q: `user:${githubLogin}`,
      per_page: 100
    });
  }

  async function getIssueComments(issue_number: number, path: string) {
    return octokit.paginate(octokit.rest.issues.listComments, {
      ...getOwnerRepoFrom(path),
      issue_number
    });
  }

  function getCommit(owner, repo, ref) {
    return octokit.rest.repos.getCommit({
      owner,
      repo,
      ref
    });
  }

  async function getIssue(issue_number: number, path: string) {
    return octokit.rest.issues.get({ ...getOwnerRepoFrom(path), issue_number });
  }

  async function getParticipants(pullRequestGitId: number, path: string) {
    const response = await getCommitsOfPr(pullRequestGitId, path);
    const commits = response || [];

    if (!commits.length) return [];

    const users = [];

    for (const {
      author: { login }
    } of commits)
      if (!users.includes(login)) users.push(login);

    return users;
  }

  async function getPullRequest(pull_number: number, path: string) {
    return octokit.rest.pulls.get({ ...getOwnerRepoFrom(path), pull_number });
  }

  async function getPullRequestComments(pull_number: number, path: string) {
    return octokit.paginate(octokit.rest.issues.listComments, {
      ...getOwnerRepoFrom(path),
      issue_number: pull_number
    });
  }

  async function listBranches(path: string) {
    return octokit.paginate(octokit.rest.repos.listBranches, { ...getOwnerRepoFrom(path) });
  }

  async function authenticate(auth: string) {
    if (!auth) return;

    setOctokit(new Octokit({ auth }));
    setAuthenticaded(true);
  }

  useEffect(() => {
    authenticate(user?.accessToken);
  }, [user?.accessToken]);

  return {
    getIssue,
    getCommit,
    getIssueComments,
    getCommitsOfPr,
    getForksOf,
    getUserRepos,
    getStargazers,
    authenticate,
    getParticipants,
    listBranches,
    getPullRequest,
    getPullRequestComments,
    listUserRepos
  };
}

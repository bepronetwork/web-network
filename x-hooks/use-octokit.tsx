import { Octokit } from "octokit";

import { useAuthentication } from "contexts/authentication";

export default function useOctokit() {
  const { user } = useAuthentication();

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    return { owner, repo };
  }

  function getOctoKitInstance() {
    if (!user?.accessToken) return undefined;

    return new Octokit({ auth: user.accessToken });
  }

  async function getStargazers(path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    const forks = await github.paginate(github.rest.repos.listForks, {
      ...getOwnerRepoFrom(path)
    });

    const stars = await github.paginate(github.rest.activity.listStargazersForRepo, {
      ...getOwnerRepoFrom(path)
    });

    const toLen = (array) =>
      array.length > 99 ? "+99" : array.length.toString();

    return { forks: toLen(forks), stars: toLen(stars) };
  }

  async function getCommitsOfPr(pull_number: number, path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.paginate(github.rest.pulls.listCommits, {
      ...getOwnerRepoFrom(path),
      pull_number
    });
  }

  async function getForksOf(path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.paginate(github.rest.repos.listForks, {
      ...getOwnerRepoFrom(path)
    });
  }

  async function getUserRepos(githubLogin: string, repoName: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.rest.repos.get({ owner: githubLogin, repo: repoName });
  }

  async function listUserRepos(githubLogin: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.rest.search.repos({
      q: `user:${githubLogin}`,
      per_page: 100
    });
  }

  async function getIssueComments(issue_number: number, path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.paginate(github.rest.issues.listComments, {
      ...getOwnerRepoFrom(path),
      issue_number
    });
  }

  function getCommit(owner, repo, ref) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.rest.repos.getCommit({
      owner,
      repo,
      ref
    });
  }

  async function getIssue(issue_number: number, path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.rest.issues.get({ ...getOwnerRepoFrom(path), issue_number });
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
    const github = getOctoKitInstance();

    if (!github) return;

    return github.rest.pulls.get({ ...getOwnerRepoFrom(path), pull_number });
  }

  async function getPullRequestComments(pull_number: number, path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.paginate(github.rest.issues.listComments, {
      ...getOwnerRepoFrom(path),
      issue_number: pull_number
    });
  }

  async function listBranches(path: string) {
    const github = getOctoKitInstance();

    if (!github) return;

    return github.paginate(github.rest.repos.listBranches, { ...getOwnerRepoFrom(path) });
  }

  return {
    getIssue,
    getCommit,
    getIssueComments,
    getCommitsOfPr,
    getForksOf,
    getUserRepos,
    getStargazers,
    getParticipants,
    listBranches,
    getPullRequest,
    getPullRequestComments,
    listUserRepos
  };
}

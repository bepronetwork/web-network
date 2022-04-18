import { useEffect, useState } from "react";

import { OctokitResponse } from "@octokit/types";
import { Octokit } from "octokit";

import { useAuthentication } from "contexts/authentication";

export default function useOctokit() {
  const { user } = useAuthentication();
  const [octokit, setOctokit] = useState<Octokit>(new Octokit());

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    return { owner, repo };
  }

  async function getStargazers(path: string) {
    const { data: forks } = await withCache("getStargazers1", octokit.rest.repos.listForks, {
      ...getOwnerRepoFrom(path),
      per_page: 100
    });
    const { data: stars } = await withCache("getStargazers2", octokit.rest.activity.listStargazersForRepo, {
      ...getOwnerRepoFrom(path),
      per_page: 100
    });
    const toLen = (array) =>
      array.length > 99 ? "+99" : array.length.toString();

    return { forks: toLen(forks), stars: toLen(stars) };
  }

  async function getCommitsOfPr(pull_number: number, path: string) {
    return withCache("getCommitsOfPr", octokit.rest.pulls.listCommits, {
      ...getOwnerRepoFrom(path),
      pull_number
    });
  }

  async function getForksOf(path: string) {
    return withCache("getForksOf", octokit.rest.repos.listForks, {
      ...getOwnerRepoFrom(path),
      per_page: 100
    });
  }

  async function getUserRepos(githubLogin: string, repoName: string) {
    return withCache("getUserRepos", octokit.rest.repos.get, { owner: githubLogin, repo: repoName });
  }

  async function listUserRepos(githubLogin: string) {
    return withCache("listUserRepos", octokit.rest.search.repos, {
      q: `user:${githubLogin}`,
      per_page: 100
    });
  }

  async function getIssueComments(issue_number: number, path: string) {
    return withCache("getIssueComments", octokit.rest.issues.listComments, {
      ...getOwnerRepoFrom(path),
      issue_number
    });
  }

  function getCommit(owner, repo, ref) {
    return withCache("getCommit", octokit.rest.repos.getCommit, {
      owner,
      repo,
      ref
    });
  }

  async function getIssue(issue_number: number, path: string) {
    return withCache("getIssue", octokit.rest.issues.get, { ...getOwnerRepoFrom(path), issue_number });
  }

  async function getParticipants(pullRequestGitId: number, path: string) {
    const response = await getCommitsOfPr(pullRequestGitId, path);
    const commits = response.data || [];

    if (!commits.length) return [];

    const users = [];

    for (const {
      author: { login }
    } of commits)
      if (!users.includes(login)) users.push(login);

    return users;
  }

  async function getPullRequest(pull_number: number, path: string) {
    return withCache("getPullRequest", octokit.rest.pulls.get, { ...getOwnerRepoFrom(path), pull_number });
  }

  async function getPullRequestComments(pull_number: number, path: string) {
    return withCache("getPullRequestComments", octokit.rest.issues.listComments,{
      ...getOwnerRepoFrom(path),
      issue_number: pull_number
    });
  }

  async function listBranches(path: string) {
    return withCache("listBranches", octokit.rest.repos.listBranches, { ...getOwnerRepoFrom(path) });
  }

  async function withCache(fnName, fn, params): Promise<OctokitResponse<any>> {
    return new Promise(async (resolve, reject) => {      
      await fn(params).then(response => {
        localStorage.setItem(fnName, JSON.stringify(response));

        resolve(response);
      })
      .catch(error => {
        if (!error?.message?.includes('API rate limit exceeded')) reject(error);

        resolve(JSON.parse(localStorage.getItem(fnName)));
      });
    });
  }

  async function authenticate(auth: string) {
    if (!auth) return;

    setOctokit(new Octokit({ auth }));
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

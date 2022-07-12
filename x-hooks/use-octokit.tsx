import { Octokit } from 'octokit';
import { useState } from 'react';
import { GithubRequestParams } from '@interfaces/github';
import { GithubActions } from '@interfaces/enums/github-actions';
import api from '@services/api';

export default function useOctokit() {
  const [octokit, setOctokit] = useState<Octokit>(new Octokit());

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split(`/`);
    return {owner, repo};
  }

  function makeOctokitRequest(action: GithubActions, params: GithubRequestParams) {
    return api.post("/github", { action, params })
      .then(({ data }) => data)
      .catch(error => {
        console.log("makeOctokitRequest", error);
      });
  }

  async function getCommitsOfPr(pull_number: number, path: string) {
    return makeOctokitRequest(GithubActions.PullRequestCommits, { ...getOwnerRepoFrom(path), pull_number });
  }

  async function getForksOf(path: string) {
    return makeOctokitRequest(GithubActions.RepositoryForks, { ...getOwnerRepoFrom(path) });
  }

  async function getUserRepos(githubLogin: string, repoName: string) {
    return makeOctokitRequest(GithubActions.UserRepositories, { owner: githubLogin, repo: repoName });
  }

  async function getIssueComments(issue_number: number, path: string) {
    return makeOctokitRequest(GithubActions.PullRequestOrIssueComments, { ...getOwnerRepoFrom(path), issue_number });
  }

  function getCommit(owner, repo, ref) {
    return makeOctokitRequest(GithubActions.Commit, { owner, repo, ref });
  }

  async function getIssue(issue_number: number, path: string,) {
    return makeOctokitRequest(GithubActions.Issue, { ...getOwnerRepoFrom(path), issue_number });
  }

  async function getParticipants(pullRequestGitId: number, path: string) {

    const commits = await getCommitsOfPr(pullRequestGitId, path);

    if (!commits.length)
      return [];

    const users = [];

    for (const {author: {login}} of commits)
      if (!users.includes(login))
        users.push(login)

    return users;
  }

  async function getPullRequest(pull_number: number, path: string) {
    return makeOctokitRequest(GithubActions.PullRequest, { ...getOwnerRepoFrom(path), pull_number });
  }

  async function getPullRequestComments(pull_number: number, path: string) {
    return makeOctokitRequest(GithubActions.PullRequestOrIssueComments, { ...getOwnerRepoFrom(path), issue_number: pull_number });
  }

  async function listBranches(path: string) {
    return makeOctokitRequest(GithubActions.RepositoryBranches, { ...getOwnerRepoFrom(path) });
  }

  return {getIssue, getCommit, getIssueComments, getCommitsOfPr, getForksOf, getUserRepos, getParticipants, listBranches, getPullRequest, getPullRequestComments};

}

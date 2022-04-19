import {Octokit} from 'octokit';
import {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';

export default function useOctokit() {
  const {state:{accessToken}} = useContext(ApplicationContext);
  const [octokit, setOctokit] = useState<Octokit>(new Octokit());

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split(`/`);
    return {owner, repo};
  }

  async function getStargazers(path: string) {
    const {data: forks} = await octokit.rest.repos.listForks({...getOwnerRepoFrom(path), per_page: 100,});
    const {data: stars} = await octokit.rest.activity.listStargazersForRepo({...getOwnerRepoFrom(path), per_page: 100,})
    const toLen = (array) =>  array.length > 99 ? `+99` : array.length.toString();

    return { forks: toLen(forks), stars: toLen(stars), };
  }

  async function getCommitsOfPr(pull_number: number, path: string) {
    return octokit.paginate(octokit.rest.pulls.listCommits, { ...getOwnerRepoFrom(path), pull_number});
  }

  async function getForksOf(path: string) {
    return octokit.rest.repos.listForks({ ...getOwnerRepoFrom(path), per_page: 100, });
  }

  async function getUserRepos(githubLogin: string, repoName: string) {
    return octokit.rest.repos.get({owner: githubLogin, repo: repoName})
  }

  async function getIssueComments(issue_number: number, path: string,) {
    return octokit.rest.issues.listComments({ ...getOwnerRepoFrom(path), issue_number })
  }

  function getCommit(owner, repo, ref) {
    return octokit.rest.repos.getCommit({
      owner,
      repo,
      ref
    })
  }

  async function getIssue(issue_number: number, path: string,) {
    return octokit.rest.issues.get({ ...getOwnerRepoFrom(path), issue_number })
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
    return octokit.rest.pulls.get({...getOwnerRepoFrom(path), pull_number,})
  }

  async function getPullRequestComments(pull_number: number, path: string) {
    return octokit.rest.issues.listComments({...getOwnerRepoFrom(path), issue_number: pull_number})
  }

  async function listBranches(path: string,) {
    return octokit.rest.repos.listBranches({...getOwnerRepoFrom(path)});
  }

  async function authenticate(auth: string) {
    if (!auth)
      return;

    setOctokit(new Octokit({auth}));
  }

  useEffect(() => { authenticate(accessToken) }, [accessToken])

  return {getIssue, getCommit, getIssueComments, getCommitsOfPr, getForksOf, getUserRepos, getStargazers, authenticate, getParticipants, listBranches, getPullRequest, getPullRequestComments};

}

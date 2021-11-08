import {Octokit} from 'octokit';
import {useEffect, useState} from 'react';

export default function useOctokit() {
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
    return octokit.rest.pulls.listCommits({ ...getOwnerRepoFrom(path), pull_number })
  }

  async function getForksOf(path: string) {
    return octokit.rest.repos.listForks({ ...getOwnerRepoFrom(path), per_page: 100, });
  }

  async function getIssueComments(issue_number: number, path: string,) {
    return octokit.rest.issues.listComments({ ...getOwnerRepoFrom(path), issue_number })
  }

  async function getIssue(issue_number: number, path: string,) {
    return octokit.rest.issues.get({ ...getOwnerRepoFrom(path), issue_number })
  }

  async function getParticipants(pullRequestGitId: number, path: string) {

    const response = await getCommitsOfPr(pullRequestGitId, path);
    const commits = response.data || [];

    if (!commits.length)
      return [];

    const users = [];

    for (const {author: {name}} of commits)
      if (!users.includes(name))
        users.push(name)

    return users;
  }

  async function authenticate(auth: string) {
    setOctokit(new Octokit({auth}));
  }

  return {getIssue, getIssueComments, getCommitsOfPr, getForksOf, getStargazers, authenticate};

}

import { graphql } from "@octokit/graphql";

import { useAuthentication } from "contexts/authentication";

import * as CommentsQueries from "graph-ql-queries/comments";
import * as PullRequestQueries from "graph-ql-queries/pull-request";
import * as RepositoryQueries from "graph-ql-queries/repository";
import * as UserQueries from "graph-ql-queries/user";

import { getPropertyRecursively } from "helpers/object";

export default function useOctokitGraph() {
  const { user } = useAuthentication();

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    return { owner, repo };
  }

  function getOctoKitInstance() {
    if (!user?.accessToken) return undefined;

    return graphql.defaults({
      headers: {
        authorization: `token ${user?.accessToken}`
      }
    });
  }

  /**
   * Get all pages of a graphql list, the query MUST CONTAIN `pageInfo` and `cursor` parameters
   * @param query string containing the GraphQL query
   * @param variables that mus be passed to the GraphQL query
   * @returns an array of objects containing the data returned by the GraphQL query
   */
  async function getAllPages(query, variables) {
    const api = getOctoKitInstance();
    
    if (!api) return;

    const pages = [];
    let nextPageCursor = null;
    let hasMorePages = false;

    do {
      const response = await api(query, {...variables, cursor: nextPageCursor});

      pages.push(response);

      const { endCursor, hasNextPage } = getPropertyRecursively("pageInfo", response);

      nextPageCursor = endCursor;
      hasMorePages = hasNextPage;

    } while (hasMorePages);

    return pages;
  }

  async function getPullRequestParticipants(repositoryPath:  string, pullId: number): Promise<string[]> {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(PullRequestQueries.Participants, {
      repo,
      owner,
      pullId
    });

    const participants = 
      response?.flatMap(item => getPropertyRecursively("nodes", item).map(node => node["login"]));

    return participants;
  }

  async function getPullRequestLinesOfCode(repositoryPath:  string, pullId: number): Promise<number> {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const githubAPI = getOctoKitInstance();

    const response = await githubAPI?.(PullRequestQueries.LinesOfCode, {
      repo,
      owner,
      pullId
    });

    const { additions, deletions } = response["repository"]["pullRequest"];

    return additions + deletions;
  }

  async function getIssueOrPullRequestComments(repositoryPath:  string, id: number) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(CommentsQueries.Comments, {
      repo,
      owner,
      id
    });

    const comments = 
      response?.flatMap(item => getPropertyRecursively("nodes", item)
                        .map(node => ({...node, author: node["author"]["login"]}) ) );

    return comments;
  }

  async function getPullRequestDetails(repositoryPath:  string, id: number) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const githubAPI = getOctoKitInstance();

    const response = await githubAPI?.(PullRequestQueries.Details, {
      repo,
      owner,
      id
    });

    const { mergeable, merged, state } = response["repository"]["pullRequest"];

    return { mergeable, merged, state };
  }

  async function getRepositoryForks(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(RepositoryQueries.Forks, {
      repo,
      owner
    });

    const forks = 
      response?.flatMap(item => getPropertyRecursively("nodes", item).map(node => node["owner"]["login"] ) );

    return forks;
  }

  async function getRepositoryBranches(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(RepositoryQueries.Branches, {
      repo,
      owner
    });

    const branches = response?.flatMap(item => getPropertyRecursively("nodes", item).map(node => node["name"] ) );

    return branches;
  }

  async function getUserRepositories(login:  string) {

    const response = await getAllPages(UserQueries.Repositories, {
      login
    });

    const repositories = response?.flatMap(item => getPropertyRecursively("nodes", item) );

    return repositories;
  }
  
  return {
    getPullRequestParticipants,
    getPullRequestLinesOfCode,
    getIssueOrPullRequestComments,
    getPullRequestDetails,
    getRepositoryForks,
    getRepositoryBranches,
    getUserRepositories
  };
}

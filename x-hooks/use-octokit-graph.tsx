import { Octokit  } from "octokit";

import { useAuthentication } from "contexts/authentication";

import * as CommentsQueries from "graphql/comments";
import * as PullRequestQueries from "graphql/pull-request";
import * as RepositoryQueries from "graphql/repository";
import * as UserQueries from "graphql/user";

import { getPropertyRecursively } from "helpers/object";

import { GraphQlQueryResponseData, GraphQlResponse } from "types/octokit";

export default function useOctokitGraph() {
  const { user } = useAuthentication();

  function getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    
    return { owner, repo };
  }

  function getOctoKitInstance(): Octokit["graphql"] {
    if (!user?.accessToken) return undefined;

    const octokit = new Octokit({ auth: user.accessToken });

    return octokit.graphql;
  }

  /**
   * Get all pages of a graphql list, the query MUST CONTAIN `pageInfo` and `cursor` parameters
   * @param query string containing the GraphQL query
   * @param variables that mus be passed to the GraphQL query
   * @returns an array of objects containing the data returned by the GraphQL query
   */
  async function getAllPages(query, variables): Promise<GraphQlResponse[]> {
    const api = getOctoKitInstance();
    
    if (!api) return;

    const pages = [];
    let nextPageCursor = null;
    let hasMorePages = false;

    do {
      const response = await api<GraphQlResponse>(query, {...variables, cursor: nextPageCursor});

      pages.push(response);

      const { endCursor, hasNextPage } = getPropertyRecursively<GraphQlQueryResponseData>("pageInfo", response);

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
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                .map(node => node["login"]));

    return participants;
  }

  async function getPullRequestLinesOfCode(repositoryPath:  string, pullId: number): Promise<number> {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const githubAPI = getOctoKitInstance();

    if (!githubAPI) return 0;

    const response = await githubAPI<GraphQlResponse>(PullRequestQueries.LinesOfCode, {
      repo,
      owner,
      pullId
    });

    const { additions, deletions } = response.repository.pullRequest;

    return additions + deletions;
  }

  async function getIssueOrPullRequestComments(repositoryPath:  string, id: number) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(CommentsQueries.List, {
      repo,
      owner,
      id
    });

    const comments = 
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                        .map(node => ({...node, author: node["author"]["login"]}) ) );

    return comments;
  }

  async function getPullRequestDetails(repositoryPath:  string, id: number) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const githubAPI = getOctoKitInstance();

    if (!githubAPI) return;

    const response = await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
      repo,
      owner,
      id
    });

    const { mergeable, merged, state } = response.repository.pullRequest;

    return { mergeable, merged, state };
  }

  async function getRepositoryForks(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(RepositoryQueries.Forks, {
      repo,
      owner
    });

    const forks = 
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                .map(node => node?.owner?.login ) );

    return forks;
  }

  async function getRepositoryBranches(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(RepositoryQueries.Branches, {
      repo,
      owner
    });

    const branches = response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                                .map(node => node?.name ) );

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

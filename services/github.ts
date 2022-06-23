import { Octokit } from "octokit";

import * as CommentsQueries from "graphql/comments";
import * as PullRequestQueries from "graphql/pull-request";
import * as RepositoryQueries from "graphql/repository";
import * as UserQueries from "graphql/user";

import { getPropertyRecursively } from "helpers/object";

import { GraphQlQueryResponseData, GraphQlResponse } from "types/octokit";

class Github {
  private _accessToken: string;
  private _octokit: Octokit;

  get accessToken() { return this._accessToken; }
  get octokit() { return this._octokit; }

  constructor(accessToken: string) {
    this._accessToken = accessToken;
    this._octokit = new Octokit({ auth: this._accessToken });
  }

  graphql() {
    return this._octokit.graphql;
  }

  getOwnerRepoFrom(path: string) {
    const [owner, repo] = path.split("/");
    
    return { owner, repo };
  }

  /**
   * Get all pages of a graphql list, the query MUST CONTAIN `pageInfo` and `cursor` parameters
   * @param query string containing the GraphQL query
   * @param variables that mus be passed to the GraphQL query
   * @returns an array of objects containing the data returned by the GraphQL query
   */
  async getAllPages(query, variables): Promise<GraphQlResponse[]> {
    const pages = [];
    let nextPageCursor = null;
    let hasMorePages = false;

    do {
      const response = await this.graphql()<GraphQlResponse>(query, { ...variables, cursor: nextPageCursor })
        .then(data => data)
        .catch(error => error.data);

      pages.push(response);

      const { endCursor, hasNextPage } = getPropertyRecursively<GraphQlQueryResponseData>("pageInfo", response);

      nextPageCursor = endCursor;
      hasMorePages = hasNextPage;

    } while (hasMorePages);

    return pages;
  }

  async getPullRequestParticipants(repositoryPath:  string, pullId: number): Promise<string[]> {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.getAllPages(PullRequestQueries.Participants, {
      repo,
      owner,
      pullId
    });

    const participants = 
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                .map(node => node["login"]));

    return participants;
  }

  async getPullRequestLinesOfCode(repositoryPath:  string, pullId: number): Promise<number> {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.graphql()<GraphQlResponse>(PullRequestQueries.LinesOfCode, {
      repo,
      owner,
      pullId
    });

    const { additions, deletions } = response.repository.pullRequest;

    return additions + deletions;
  }

  async getIssueOrPullRequestComments(repositoryPath:  string, id: number) {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.getAllPages(CommentsQueries.List, {
      repo,
      owner,
      id
    });

    const comments = 
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                        .map(node => ({...node, author: node["author"]["login"]}) ) );

    return comments;
  }

  async getPullRequestDetails(repositoryPath:  string, id: number) {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.graphql()<GraphQlResponse>(PullRequestQueries.Details, {
      repo,
      owner,
      id
    });

    const { mergeable, merged, state } = response.repository.pullRequest;

    return { mergeable, merged, state };
  }

  async getRepositoryForks(repositoryPath:  string) {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.getAllPages(RepositoryQueries.Forks, {
      repo,
      owner
    });

    const forks = 
      response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                .map(node => node?.owner?.login ) );

    return forks;
  }

  async getRepositoryBranches(repositoryPath:  string) {
    const { owner, repo } = this.getOwnerRepoFrom(repositoryPath);

    const response = await this.getAllPages(RepositoryQueries.Branches, {
      repo,
      owner
    });

    const branches = response?.flatMap(item => getPropertyRecursively<GraphQlQueryResponseData>("nodes", item)
                                                .map(node => node?.name ) );

    return branches;
  }

  async getUserRepositories(login:  string) {

    const response = await this.getAllPages(UserQueries.Repositories, {
      login
    });

    const userRepositories = response.flatMap<{
      name: string;
      nameWithOwner: string;
      isFork: boolean;
      isOrganization: boolean;
      owner: string;
    }>(item => {
      return getPropertyRecursively<GraphQlQueryResponseData>("nodes", item?.["user"]?.repositories)
        .map(el => ({
          ...el,
          owner: el.owner.login,
          isOrganization: false
        }));
    });

    const organizationRepositories = response.flatMap<{
      name: string;
      nameWithOwner: string;
      isFork: boolean;
      isOrganization: boolean;
      owner: string;
    }>(item => {
      return item?.["user"]?.organizations?.nodes?.
              filter(el => el !== null)
              .flatMap(el => getPropertyRecursively<GraphQlQueryResponseData>("nodes", el))
              .map(repo => ({...repo, owner: repo.owner.login, isOrganization: true}));
    });

    return [...userRepositories, ...organizationRepositories];
  }
}

export default Github;
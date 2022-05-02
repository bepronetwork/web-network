import { graphql } from "@octokit/graphql";

import { useAuthentication } from "contexts/authentication";

const getPropertyRecursively = (property, data) => {
  if (data[property]) return data[property];

  let found = {};

  for(const key in data) found = getPropertyRecursively(property, data[key]);

  return found;
};

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

    const response = await getAllPages(`
        query PullRequestParticipants($repo: String!, $owner: String!, $pullId: Int!, $cursor: String) {
          repository(name: $repo, owner: $owner) {
              pullRequest(number: $pullId) {
                  participants(first: 100, after: $cursor) {
                      pageInfo {
                          endCursor
                          hasNextPage
                      }
                      nodes {
                          login
                      }
                  }
              }
          }
      }
    `, {
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

    const response = await getAllPages(`
        query PullRequestParticipants($repo: String!, $owner: String!, $pullId: Int!) {
          repository(name: $repo, owner: $owner) {
              pullRequest(number: $pullId) {
                additions
                deletions
              }
          }
      }
    `, {
      repo,
      owner,
      pullId
    });

    const { additions, deletions } = response[0]["repository"]["pullRequest"];

    return additions + deletions;
  }

  async function getIssueOrPullRequestComments(repositoryPath:  string, id: number) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(`
        query Comments($repo: String!, $owner: String!, $id: Int!, $cursor: String) {
          repository(name: $repo, owner: $owner) {
              issueOrPullRequest(number: $id) {
                  ... on PullRequest {
                      comments(first: 100, after: $cursor) {
                          pageInfo {
                              endCursor
                              hasNextPage
                          }
                          nodes {
                              author {
                                  login
                              }
                              updatedAt
                              body
                          }
                      }
                  }
                  ... on Issue {
                      comments(first: 100, after: $cursor) {
                          pageInfo {
                              endCursor
                              hasNextPage
                          }
                          nodes {
                              author {
                                  login
                              }
                              updatedAt
                              body
                          }
                      }
                  }
              }
          }
      }
    `, {
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

    const response = await getAllPages(`
      query PullRequestDetails($repo: String!, $owner: String!, $id: Int!) {
        repository(name: $repo, owner: $owner) {
          pullRequest(number: $id) {
            mergeable
            merged
            state
          }
        }
      }
    `, {
      repo,
      owner,
      id
    });

    const { mergeable, merged, state } = response[0]["repository"]["pullRequest"];

    return { mergeable, merged, state };
  }

  async function getRepositoryForks(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(`
      query Forks($repo: String!, $owner: String!, $cursor: String) {
        repository(name: $repo, owner: $owner) {
            forks(first: 100, after: $cursor) {
                pageInfo {
                    endCursor
                    hasNextPage
                }
                nodes {
                    owner {
                        login
                    }
                }
            }
        }
      }
    `, {
      repo,
      owner
    });

    const forks = 
      response?.flatMap(item => getPropertyRecursively("nodes", item).map(node => node["owner"]["login"] ) );

    return forks;
  }

  async function getRepositoryBranches(repositoryPath:  string) {
    const { owner, repo } = getOwnerRepoFrom(repositoryPath);

    const response = await getAllPages(`
      query Forks($repo: String!, $owner: String!, $cursor: String) {
        repository(name: $repo, owner: $owner) {
          refs(first: 100, refPrefix:"refs/heads/", after: $cursor) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              name
            }
          }
        }
      }
    `, {
      repo,
      owner
    });

    const branches = response?.flatMap(item => getPropertyRecursively("nodes", item).map(node => node["name"] ) );

    return branches;
  }

  async function getUserRepositories(login:  string) {

    const response = await getAllPages(`
      query Repositories($login: String!, $cursor: String) {
        user(login: $login) {
          repositories(first: 100, after: $cursor) {
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              name
              nameWithOwner
              isFork
            }
          }
        }
      }
    `, {
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

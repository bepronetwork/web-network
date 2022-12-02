export const Participants = 
  `query Participants($repo: String!, $owner: String!, $pullId: Int!, $cursor: String) {
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
  }`;

export const LinesOfCode = 
  `query LinesOfCode($repo: String!, $owner: String!, $pullId: Int!) {
    repository(name: $repo, owner: $owner) {
        pullRequest(number: $pullId) {
          additions
          deletions
        }
    }
  }`;

export const Details = 
  `query Details($repo: String!, $owner: String!, $id: Int!) {
    repository(name: $repo, owner: $owner) {
      pullRequest(number: $id) {
        hash: id
        mergeable
        merged
        state
        approvals: reviews(states: APPROVED) {
          total: totalCount
        }
      }
    }
  }`;

export const Close =
`mutation ClosePullRequest($pullRequestId: ID!) {
  closePullRequest(
    input: {
      pullRequestId: $pullRequestId
    }
  ) {
    pullRequest {
      id
      number
    }
  }
}`;

export const Create =
`mutation CreatePullRequest(
  $repositoryId: ID!, 
  $title: String!, 
  $body: String!, 
  $head: String!, 
  $base: String!, 
  $maintainerCanModify: Boolean, 
  $draft: Boolean ) {
  createPullRequest(
    input: {
      baseRefName: $base,
      body: $body,
      headRefName: $head,
      repositoryId: $repositoryId,
      title: $title,
      maintainerCanModify: $maintainerCanModify,
      draft: $draft
    }
  ) {
    pullRequest {
      id
      number
    }
  }
}`;

export const Merge =
`mutation MergePullRequest($pullRequestId: ID!) {
  mergePullRequest(
    input: {
      pullRequestId: $pullRequestId
    }
  ) {
    pullRequest {
      id
    }
  }
}`;

export const PullRequests = `
query Repository($repo: String!, $owner: String!) {
  repository(name: $repo, owner: $owner) {
    nameWithOwner
    visibility
    mergeCommitAllowed
    pullRequests(first: 100, states: OPEN) {
      nodes {
        baseRefName
        headRefName
        headRepositoryOwner {
          login
        }
      }
    }
  }
}
`;

export const Approve =
`mutation ApprovePullRequest($pullRequestId: ID!, $body: String!) {
  addPullRequestReview(
    input: { pullRequestId: $pullRequestId, event: APPROVE, body: $body }
  ) {
    pullRequest {
      id
    }
  }
}`;
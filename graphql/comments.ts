export const Create =
`mutation CreateComment($issueOrPullRequestId: ID!, $body: String!) {
    addComment(
        input: {
            subjectId: $issueOrPullRequestId,
            body: $body
        }
    ) {
        commentEdge {
          node {
            author {
              login
            }
            body
            id
            updatedAt
          }
        }
      }
}`;

export const List = 
  `query Comments($repo: String!, $owner: String!, $id: Int!, $cursor: String) {
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
                        id
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
                        id
                        updatedAt
                        body
                    }
                }
            }
        }
    }
}`;
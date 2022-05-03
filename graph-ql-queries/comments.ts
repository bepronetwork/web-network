export const Comments = 
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
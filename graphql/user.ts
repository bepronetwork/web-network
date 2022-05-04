export const Repositories = 
  `query Repositories($login: String!, $cursor: String) {
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
  }`;
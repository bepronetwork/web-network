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
      organizations(first: 100) {
          nodes {
              repositories(first: 100) {
                  nodes {
                      isFork
                      name
                      nameWithOwner
                  }
              }
          }
      }
    }
  }`;
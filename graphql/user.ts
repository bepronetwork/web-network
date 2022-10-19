export const Repositories = 
  `query Repositories($login: String!, $cursor: String) {
    user(login: $login) {
      repositories(first: 100, after: $cursor, ownerAffiliations: [COLLABORATOR, ORGANIZATION_MEMBER, OWNER]) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          name
          nameWithOwner
          isFork
          isInOrganization
          owner {
            login
          }
          viewerPermission
        }
      }
    }
  }`;
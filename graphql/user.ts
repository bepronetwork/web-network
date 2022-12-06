export const Repositories = (botUser?: string) =>
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
          isArchived
          owner {
            login
          }
          viewerPermission
          mergeCommitAllowed
          parent {
            nameWithOwner
            name
          }
          ${botUser ? `collaborators(query: "${botUser}", first: 100) {
            nodes {
              login
            }
          }` : ""}
        }
      }
    }
  }`;

export const Repository = 
`
query FindUserRepository($login: String!, $repo: String!) {
  user(login: $login) {
    repository(name: $repo) {
      isFork
      parent {
        name
        nameWithOwner
      }
      name
      nameWithOwner
    }
  }
}
`;
export const Repository = 
  `query Repository($repo: String!, $owner: String!) {
    repository(name: $repo, owner: $owner) {
      nameWithOwner
      visibility
    }
  }`;

export const Forks = 
  `query Forks($repo: String!, $owner: String!, $cursor: String) {
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
  }`;

export const Branches =
  `query Branches($repo: String!, $owner: String!, $cursor: String) {
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
  }`;

export const Details =
`query Details($repo: String!, $owner: String!) {
  repository(name: $repo, owner: $owner) {
      id
      labels(first: 1, query: "draft") {
        nodes {
          id
          name
        }
      }
  }
}`;

export const CreateLabel =
`mutation CreateLabel($name: String!, $repositoryId: ID!, $color: String!, $description: String) {
  createLabel(
    input: {
      color: $color,
      name: $name,
      description: $description,
      repositoryId: $repositoryId
    }
  ) {
    label {
      id
    }
  }
}`;
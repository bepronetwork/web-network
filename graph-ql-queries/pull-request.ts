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
        mergeable
        merged
        state
      }
    }
  }`;
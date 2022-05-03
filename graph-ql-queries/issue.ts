export const Create =
`mutation OpenIssue($repositoryId: ID!, $title: String!, $body: String!, $labelId: [ID!]) {
  createIssue(
    input: {
      repositoryId: $repositoryId, 
      title: $title, 
      body: $body, 
      labelIds: $labelId
    }
  ) {
    issue {
      id
      number
    }
  }
}`;
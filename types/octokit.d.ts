export type GraphQlQueryResponseData = {
  [key: string]: any; //eslint-disable-line
};

export type GraphQlResponse = Promise<GraphQlQueryResponseData>;

export type RepositoryPermissions = "ADMIN" | "MAINTAIN" | "READ" | "TRIAGE" | "WRITE";

export type ReviewTypes = "APPROVE" | "COMMENT" | "DISMISS" | "REQUEST_CHANGES";
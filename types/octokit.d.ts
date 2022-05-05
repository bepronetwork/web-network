export type GraphQlQueryResponseData = {
  [key: string]: any;
};

export type GraphQlResponse = Promise<GraphQlQueryResponseData>;
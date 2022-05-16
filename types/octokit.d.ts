export type GraphQlQueryResponseData = {
  [key: string]: any; //eslint-disable-line
};

export type GraphQlResponse = Promise<GraphQlQueryResponseData>;
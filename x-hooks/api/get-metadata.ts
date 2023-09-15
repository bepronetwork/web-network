import { ParsedUrlQuery } from "querystring";

import { api } from "services/api";

/**
 * Get metadata from api based on url
 * @param query current url query
 * @returns metadata
 */
export default async function getMetadata(query: ParsedUrlQuery) {
  return api
    .get<{
      title: string;
      description: string;
      ogImage?: string;
      ogVideo?: string;
    }>("/metadata", { params: query })
    .then(({ data }) => data);
}

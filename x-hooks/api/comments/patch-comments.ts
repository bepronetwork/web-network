import { IssueDataComment } from "interfaces/issue-data";

import { api } from "services/api";

/**
 * Hide comments from api
 * @param query current url query
 * @returns comment
 */
export default async function HideComment(id: number,
                                          payload: {
    hidden: boolean;
  }) {
  return api.patch<IssueDataComment>(`/comments/${id}`, payload);
}

import { IssueDataComment } from "interfaces/issue-data";

import { api } from "services/api";

/**
 * Create comment in api
 * @param query current url query
 * @returns created comment
 */
export async function CreateComment(payload: {
  comment: string;
  issueId: number;
  type: "deliverable" | "issue" | "proposal" | "review";
  deliverableId?: number;
  proposalId?: number;
}) {
  return api.post<IssueDataComment>(`/comments`, payload);
}

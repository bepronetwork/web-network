import { api } from "services/api";

/**
 * Create deliverable in api
 * @param query current url query
 * @returns created deliverable
 */
export default async function CreatePreDeliverable(payload: {
  deliverableUrl: string;
  title: string;
  description: string;
  issueId: number;
}) {
  return api.post<{
    bountyId: number;
    originCID: string;
    cid: number;
  }>(`/deliverable`, payload).then(({data}) => data)
}

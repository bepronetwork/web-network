import { api } from "services/api";

/**
 * Delete pre-deliverable in api
 * @param query current url query
 * @returns deleted pre-deliverable
 */
export default async function DeletePreDeliverable(id: number) {
  return api.delete(`/deliverable/${id}`).then(({data}) => data)
}

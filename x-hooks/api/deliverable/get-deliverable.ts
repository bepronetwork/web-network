import { api } from "services/api";

/**
 * get deliverable in api
 * @param query current url query
 * @returns get deliverable
 */
export default async function getDeliverable(id: number) {
  return api.get(`/deliverable/${id}`).then(({data}) => data)
}

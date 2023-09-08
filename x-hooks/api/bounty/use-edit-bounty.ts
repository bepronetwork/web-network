import { updateIssueParams } from "interfaces/api";
import { IssueData } from "interfaces/issue-data";

import { api } from "services/api";

export async function useEditBounty({
  id,
  networkName,
  chainName,
  ...rest
}: updateIssueParams) {
  return api
    .put<IssueData>(`/issue/${id}/${networkName}/${chainName}`, rest)
    .then(({ data }) => data);
}
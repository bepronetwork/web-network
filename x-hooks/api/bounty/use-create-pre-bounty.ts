import { IssueData } from "interfaces/issue-data";

import { api } from "services/api";

interface CreatePreBounty {
  title: string;
  body: string;
  creator: string;
  deliverableType: string;
  origin?: string;
  tags: string[];
  isKyc?: boolean;
  tierList?: number[];
  amount: string;
  networkName: string;
}

export default function useCreatePreBounty(payload: CreatePreBounty): Promise<IssueData> {
  return api
    .post<IssueData>("/issue", payload)
    .then(({ data }) => data);
}
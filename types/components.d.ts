import { IssueBigNumberData } from "interfaces/issue-data";

import { SearchBountiesPaginated } from "types/api";

export interface SearchBountiesPaginatedBigNumber extends Omit<SearchBountiesPaginated, "rows"> {
  rows: IssueBigNumberData[];
}
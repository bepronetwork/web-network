import { ReactNode } from "react";

import { IssueBigNumberData } from "interfaces/issue-data";

import { SearchBountiesPaginated } from "types/api";
import { BreakpointOptions, SelectOption } from "types/utils";

export interface SearchBountiesPaginatedBigNumber extends Omit<SearchBountiesPaginated, "rows"> {
  rows: IssueBigNumberData[];
}

export interface ResponsiveListItemColumnProps {
  label?: string;
  secondaryLabel?: string;
  breakpoints?: BreakpointOptions;
  currency?: string;
  justify?: string;
}

export interface CopyButtonProps {
  value: string;
  popOverLabel?: string;
}

export interface SortOption extends Omit<SelectOption, "value"> {
  value: string;
  sortBy: string;
  order: string;
}

export interface CustomDropdownItem {
  content: ReactNode;
  onClick?: () => void;
}
import { ReactNode, ReactElement, SVGProps } from "react";

import { Currency } from "interfaces/currency";
import { IssueBigNumberData } from "interfaces/issue-data";
import { SupportedChainData } from "interfaces/supported-chain-data";
import { ProfilePages } from "interfaces/utils";

import { SearchBountiesPaginated } from "types/api";
import { BreakpointOptions, Direction, SelectOption } from "types/utils";

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

export interface HeroInfo {
  value: number | string;
  label: string;
  currency?: Currency;
  hasConvertedTokens?: boolean;
  setListedModalVisibility?: (visible: boolean) => void;
}

export interface MiniTabsItem {
  onClick: () => void;
  label: string;
  active: boolean;
}

export interface IntervalFiltersProps {
  defaultInterval?: number;
  intervals: number[];
  intervalIn?: "days" | "months" | "years";
  direction?: Direction;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
}

export interface ChainFilterProps {
  chains: SupportedChainData[];
  direction?: Direction;
  onChange?: (value: string | number) => void;
}
export interface LinkProps {
  label: string;
  href?: ProfilePages;
  icon?: (props?: SVGProps<SVGSVGElement>) => ReactElement
}
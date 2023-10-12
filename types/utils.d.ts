import BigNumber from "bignumber.js";
import { UrlObject } from "url";

import { Token, TokenInfo } from "interfaces/token";

export interface BreakpointOptions {
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  xxl?: boolean;
}

export interface GroupedSelectOption {
  label: string;
  options: SelectOption[];
}

export interface SelectOption {
  label: string;
  value: string | number;
  selected?: boolean;
}

export interface MouseEvents {
  onMouseDown: () => void;
  onTouchStart: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchEnd: () => void;
}

export interface Link {
  label: string;
  href: string | UrlObject;
}

export interface Action {
  onClick: () => void;
  label: string;
}

export interface QueryParams {
  [key: string]: string | undefined;
}

export type Direction = "vertical" | "horizontal";
export interface ConvertableItem {
  [key: string]: unknown;
  token: Token | Partial<TokenInfo>;
  value: BigNumber;
}

export interface ConvertedItem extends ConvertableItem {
  [key: string]: unknown;
  price: number;
  convertedValue: BigNumber;
}

export interface TotalFiatNetworks {
  tokenAddress: string;
  value: number;
  price: number;
  networkId: number;
}

export interface Field {
  value?: string | string[] | number;
  originalValue?: string | string[] | number;
  error?: string;
}
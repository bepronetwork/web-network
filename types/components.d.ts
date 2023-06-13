import { BreakpointOptions } from "types/utils";

export interface ResponsiveListItemColumnProps {
  label: string;
  secondaryLabel?: string;
  breakpoints?: BreakpointOptions;
  currency?: string;
}
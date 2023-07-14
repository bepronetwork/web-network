import TokenSymbolView from "components/common/token-symbol/view";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { FlexRow } from "../../wallet-balance";

export default function NetworkItemAmountView({
  amount,
  type,
  symbol,
  primaryColor,
  isNetworkVariant,
}: {
  amount: string | number;
  symbol: string;
  type?: "network" | "voting" | "payments";
  isNetworkVariant: boolean;
  primaryColor?: string;
}) {
  return (
    <FlexRow
      className={`${
        type === "voting" ? "caption-medium" : "xs-small"
      } flex-wrap align-items-center text-truncate mt-1`}
    >
      <span className="text-white mr-1">{formatNumberToCurrency(amount)}</span>
      <TokenSymbolView
        name={symbol}
        className={`${isNetworkVariant || !primaryColor ? "text-primary" : ""} text-uppercase`}
        style={{ color: primaryColor }}
      />
    </FlexRow>
  );
}

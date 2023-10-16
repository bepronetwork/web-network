import { ReactNode } from "react";

import NetworkItem from "components/profile/network-item/controller";

interface VotesAmountProps {
  label: string;
  amount: string;
  networkIcon: string | ReactNode;
  votesSymbol: string;
  tokenSymbol: string;
  tokenColor: string;
  variant?: "network" | "multi-network";
  className?: string;
}

export default function VotesAmount({
  label,
  amount,
  networkIcon,
  votesSymbol,
  tokenSymbol,
  tokenColor,
  variant,
  className,
}: VotesAmountProps) {
  return(
    <div className={className}>
      <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3">
        <span>{label}</span>
      </div>

      <NetworkItem
        type="voting"
        iconNetwork={networkIcon}
        amount={amount}
        symbol={votesSymbol}
        networkName={tokenSymbol}
        primaryColor={tokenColor}
        subNetworkText={votesSymbol}
        variant={variant}
      />
    </div>
  );
}
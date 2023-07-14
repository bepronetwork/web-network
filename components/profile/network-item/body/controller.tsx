import BodyNetworkView from "./network/view";
import BodyVotingView from "./voting/view";

interface NetworkItemBodyViewProps {
  isCollapsed: boolean;
  handleNetworkLink: () => void;
  type: "network" | "voting" | "payments";
  amount: string | number;
  symbol: string;
  isNetworkVariant: boolean;
  primaryColor?: string;
  isNetworkType: boolean;
  handleToggleCollapse: () => void;
}

export default function NetworkItemBody({
  isCollapsed,
  type,
  amount,
  symbol,
  isNetworkVariant,
  primaryColor,
  handleNetworkLink,
  isNetworkType,
  handleToggleCollapse,
}: NetworkItemBodyViewProps) {
  if (isNetworkType)
    return (
      <BodyNetworkView
        isCollapsed={isCollapsed}
        handleNetworkLink={handleNetworkLink}
        type={type}
        amount={amount}
        symbol={symbol}
        isNetworkVariant={isNetworkVariant}
        primaryColor={primaryColor}
        handleToggleCollapse={handleToggleCollapse}
      />
    );

  return (
    <BodyVotingView
      handleNetworkLink={handleNetworkLink}
      type={type}
      amount={amount}
      symbol={symbol}
      isNetworkVariant={isNetworkVariant}
      primaryColor={primaryColor}
    />
  );
}

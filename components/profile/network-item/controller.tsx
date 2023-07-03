import { ReactNode, useState } from "react";

import { useAppState } from "contexts/app-state";

import NetworkItemView from "./view";

interface NetworkItemProps {
  children?: ReactNode;
  key?: number | string;
  type?: "network" | "voting";
  networkName: string;
  subNetworkText?: string;
  primaryColor?: string;
  iconNetwork: string | ReactNode;
  amount: string | number;
  symbol: string;
  handleNetworkLink?: () => void;
  variant?: "network" | "multi-network";
}

export default function NetworkItem({
  key,
  children,
  type,
  amount,
  symbol,
  handleNetworkLink,
  iconNetwork,
  networkName,
  subNetworkText,
  primaryColor,
  variant = "network",
}: NetworkItemProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const {
    state: { Settings: settings },
  } = useAppState();

  const isNetworkVariant = variant === "network";
  const isNetworkType = type === "network";

  function toggleCollapse() {
    setIsCollapsed((previous) => !previous);
  }

  return (
    <NetworkItemView
      key={key}
      networkName={networkName}
      iconNetwork={iconNetwork}
      amount={amount}
      symbol={symbol}
      isNetworkVariant={isNetworkVariant}
      isNetworkType={isNetworkType}
      isCollapsed={isCollapsed}
      handleToggleCollapse={toggleCollapse}
      srcLogo={`${settings?.urls?.ipfs}/${iconNetwork}`}
      type={type}
      subNetworkText={subNetworkText}
      primaryColor={primaryColor}
      handleNetworkLink={handleNetworkLink}
    >
      {children}
    </NetworkItemView>
  );
}

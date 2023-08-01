import { ReactNode, useState } from "react";

import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";

import useBreakPoint from "x-hooks/use-breakpoint";
import { useNetwork } from "x-hooks/use-network";

import NetworkItemView from "./view";
interface NetworkItemProps {
  children?: ReactNode;
  key?: number | string;
  type?: "network" | "voting" | "payments";
  networkChain?: string;
  networkName: string;
  subNetworkText?: string;
  primaryColor?: string;
  iconNetwork: string | ReactNode;
  amount: string | number;
  symbol: string;
  handleNetworkLink?: () => void;
  variant?: "network" | "multi-network";
  handleToggleTabletAndMobile?: () => void;
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
  networkChain,
  subNetworkText,
  primaryColor,
  variant = "network",
  handleToggleTabletAndMobile
}: NetworkItemProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  const {
    state: { Settings: settings, currentUser },
  } = useAppState();
  const { query } = useRouter();
  const { goToProfilePage } = useNetwork();
  const { isDesktopView } = useBreakPoint();

  const isNetworkVariant = variant === "network";
  const isNetworkType = ["network", "payments"].includes(type);

  function toggleCollapse() {
    if(handleToggleTabletAndMobile && query?.profilePage[0] === 'voting-power' && !isDesktopView){
      handleToggleTabletAndMobile()
    } else if (isNetworkType && !isDesktopView) {
      goToProfilePage("payments", {
        networkName,
        networkChain,
        wallet: currentUser?.walletAddress
      });
    } else setIsCollapsed((previous) => !previous);
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

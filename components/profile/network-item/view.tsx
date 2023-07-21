import { ReactNode } from "react";

import ResponsiveWrapper from "components/responsive-wrapper";

import { FlexRow } from "../../common/flex-box/view";
import NetworkItemBody from "./body/controller";
import NetworkItemTitleView from "./title/view";

interface NetworkItemViewProps {
  children?: ReactNode;
  key?: number | string;
  type?: "network" | "voting" | "payments";
  networkName: string;
  subNetworkText?: string;
  primaryColor?: string;
  iconNetwork: string | ReactNode;
  amount: string | number;
  symbol: string;
  handleNetworkLink?: () => void;
  isNetworkVariant: boolean;
  isNetworkType: boolean;
  isCollapsed: boolean;
  handleToggleCollapse: () => void;
  srcLogo: string;
}

export default function NetworkItemView({
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
  isNetworkVariant,
  isNetworkType,
  isCollapsed,
  handleToggleCollapse,
  srcLogo,
}: NetworkItemViewProps) {
  return (
    <div
      className={`bg-gray-${
        !isNetworkVariant && isNetworkType ? "900" : "950"
      } p-3 border border-gray-800 border-radius-4 my-2`}
      key={key}
    >
      <FlexRow
        className={`${!isNetworkType && "justify-content-between"} flex-wrap`}
      >
        <NetworkItemTitleView
          isNetworkType={isNetworkType}
          iconNetwork={iconNetwork}
          srcLogo={srcLogo}
          networkName={networkName}
          subNetworkText={subNetworkText}
        />
        <ResponsiveWrapper xs={true} md={false} className="ms-2">
          <div className="mw-repo text-truncate">
            <span className="text-gray">{subNetworkText}</span>
          </div>
        </ResponsiveWrapper>
        <NetworkItemBody
          isCollapsed={isCollapsed}
          handleNetworkLink={handleNetworkLink}
          type={type}
          amount={amount}
          symbol={symbol}
          isNetworkVariant={isNetworkVariant}
          isNetworkType={isNetworkType}
          handleToggleCollapse={handleToggleCollapse}
          primaryColor={primaryColor}
        />
      </FlexRow>
      {children && !isCollapsed && (
        <FlexRow className="mt-3">{children}</FlexRow>
      )}
    </div>
  );
}

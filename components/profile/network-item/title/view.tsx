import { ReactNode } from "react";

import NetworkLogo from "components/network-logo";

import { FlexColumn, FlexRow } from "../../../common/flex-box/view";

interface NetworkItemTitleViewProps {
  isNetworkType: boolean;
  iconNetwork: string | ReactNode;
  srcLogo: string;
  networkName: string;
  subNetworkText: string;
}

export default function NetworkItemTitleView({
  isNetworkType,
  iconNetwork,
  srcLogo,
  networkName,
  subNetworkText,
}: NetworkItemTitleViewProps) {
  return (
    <FlexRow className={`${isNetworkType && "col-xl-3 col-6"} ${subNetworkText && 'col-6'} py-3`}>
      <FlexColumn className="justify-content-center me-2">
        {typeof iconNetwork === "string" ? (
          <NetworkLogo
            src={srcLogo}
            alt={`${networkName} logo`}
            isBepro={networkName?.toLowerCase() === "bepro"}
            size="md"
            noBg
          />
        ) : (
          iconNetwork
        )}
      </FlexColumn>
      <FlexColumn className="justify-content-center">
        <FlexRow className="flex-wrap xs-medium text-capitalize">
          {networkName}
        </FlexRow>

        {subNetworkText && (
          <FlexRow className="d-none d-sm-block">
            <span className="text-gray">{subNetworkText}</span>
          </FlexRow>
        )}
      </FlexColumn>
    </FlexRow>
  );
}

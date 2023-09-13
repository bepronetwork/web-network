import clsx from "clsx";
import {UrlObject} from "url";

import ClosedNetworkAlert from "components/closed-network-alert";
import BrandLogo from "components/common/brand-logo/view";
import ChainSelector from "components/navigation/chain-selector/controller";
import NavBarActions from "components/navigation/navbar/actions/view";
import NavBarLinks from "components/navigation/navbar/links/view";
import ResponsiveWrapper from "components/responsive-wrapper";

interface NavBarViewProps {
  isOnNetwork: boolean;
  isCurrentNetworkClosed: boolean;
  isConnected: boolean;
  brandHref: string | UrlObject;
  logoUrl: string;
  networkId: number;
}

export default function NavBarView({
  isOnNetwork,
  isCurrentNetworkClosed,
  isConnected,
  brandHref,
  logoUrl,
  networkId,
}: NavBarViewProps) {
  const isClosedAlertVisible = isOnNetwork && isCurrentNetworkClosed;
  const paddingY = isConnected ? "py-0" : "py-3";

  return (
    <div className="nav-container">
      <ClosedNetworkAlert
        isVisible={isClosedAlertVisible}
      />

      <div className="main-nav d-flex flex-column justify-content-center">
        <div
          className={clsx([
            "d-flex flex-row align-items-center justify-content-between px-3",
            paddingY
          ])}
        >
          <div className="d-flex align-items-center gap-44">
            <div className="d-flex gap-32">
              <BrandLogo
                href={brandHref}
                logoUrl={logoUrl}
                showDefaultBepro={!isOnNetwork}
              />

              <ResponsiveWrapper xs={false} xl={true}>
                <ChainSelector />
              </ResponsiveWrapper>
            </div>

            <NavBarLinks />
          </div>

          <NavBarActions networkId={networkId} />
        </div>
      </div>
    </div>
  );
}

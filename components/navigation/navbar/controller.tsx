import {useRouter} from "next/router";

import NavBarView from "components/navigation/navbar/view";

import {useAppState} from "contexts/app-state";

import {useNetwork} from "x-hooks/use-network";

export default function NavBar() {
  const { pathname } = useRouter();

  const { state } = useAppState();
  const { getURLWithNetwork, activeNetworkId } = useNetwork();

  const isOnNetwork = pathname?.includes("[network]");
  const networkLogo = state.Service?.network?.active?.fullLogo;
  const fullLogoUrl = networkLogo && `${state.Settings?.urls?.ipfs}/${networkLogo}`;
  const brandHref = !isOnNetwork ? "/" : getURLWithNetwork("/", {
    network: state.Service?.network?.active?.name,
  });

  return (
    <NavBarView
      networkId={activeNetworkId}
      isOnNetwork={isOnNetwork}
      isCurrentNetworkClosed={state.Service?.network?.active?.isClosed}
      isConnected={!!state.currentUser?.walletAddress}
      brandHref={brandHref}
      logoUrl={fullLogoUrl}
    />
  );
}

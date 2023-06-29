import {useEffect, useState} from "react";

import {useRouter} from "next/router";

import NavBarView from "components/navigation/navbar/view";

import {useAppState} from "contexts/app-state";
import {changeCurrentUserHasRegisteredNetwork} from "contexts/reducers/change-current-user";

import useApi from "x-hooks/use-api";
import {useNetwork} from "x-hooks/use-network";

export default function NavBar() {
  const { pathname } = useRouter();

  const { state } = useAppState();
  const { dispatch } = useAppState();
  const { searchNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();
  const [checkedNetworkExistance, setCheckedNetworkExistance] = useState('');

  const isOnNetwork = pathname?.includes("[network]");

  const networkLogo = state.Service?.network?.active?.fullLogo;
  const fullLogoUrl = networkLogo && `${state.Settings?.urls?.ipfs}/${networkLogo}`;
  const brandHref = !isOnNetwork ? "/" : getURLWithNetwork("/", {
    network: state.Service?.network?.active?.name,
  });

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.connectedChain?.id)
      return;

    if (state.currentUser.walletAddress.concat(state.connectedChain.id) === checkedNetworkExistance)
      return;

    setCheckedNetworkExistance(state.currentUser.walletAddress.concat(state.connectedChain.id));

    searchNetworks({
      creatorAddress: state.currentUser?.walletAddress,
      chainId: state.connectedChain?.id,
      isClosed: false
    })
      .then(({ count, rows }) => {
        const changeIfDifferent = (has: boolean) => state.currentUser?.hasRegisteredNetwork !== has &&
          dispatch(changeCurrentUserHasRegisteredNetwork(has));

        if (count === 0) changeIfDifferent(false);
        else changeIfDifferent(!!rows[0]?.isRegistered);
      })
      .catch(error => console.debug("Failed to get network address by wallet", error));
  }, [state.currentUser?.walletAddress, state.connectedChain]);

  return (
    <NavBarView
      isOnNetwork={isOnNetwork}
      isCurrentNetworkClosed={state.Service?.network?.active?.isClosed}
      isConnected={!!state.currentUser?.walletAddress}
      brandHref={brandHref}
      logoUrl={fullLogoUrl}
    />
  );
}

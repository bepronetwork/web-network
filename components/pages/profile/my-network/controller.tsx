import { useEffect, useState } from "react";

import MyNetworkPageView from "components/pages/profile/my-network/view";

import { useAppState} from "contexts/app-state";
import { NetworkSettingsProvider, useNetworkSettings } from "contexts/network-settings";
import { changeLoadState } from "contexts/reducers/change-load";

import {Network} from "interfaces/network";

import { SearchBountiesPaginated } from "types/api";
import { MyNetworkPageProps } from "types/pages";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";

interface MyNetworkProps {
  bounties: SearchBountiesPaginated;
}

export function MyNetwork({
  bounties
}: MyNetworkProps) {
  const [myNetwork, setMyNetwork] = useState<Network>();

  const { chain } = useChain();
  const { searchNetworks } = useApi();
  const { state, dispatch } = useAppState();
  const { setForcedNetwork } = useNetworkSettings();

  async function updateEditingNetwork() {
    dispatch(changeLoadState(true));

    const chainId = chain.chainId.toString();

    searchNetworks({
      creatorAddress: state.currentUser.walletAddress,
      isClosed: false,
      chainId: chainId
    })
      .then(({ count , rows }) => {
        const savedNetwork = count > 0 ? rows[0] : undefined;

        if (savedNetwork)
          sessionStorage.setItem(`bepro.network:${savedNetwork.name.toLowerCase()}:${chainId}`,
                                 JSON.stringify(savedNetwork));

        setMyNetwork(savedNetwork);
        setForcedNetwork(savedNetwork);
      })
      .catch(error => console.debug("Failed to get network", error))
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !chain) return;

    updateEditingNetwork();
  }, [state.currentUser?.walletAddress, chain]);

  return(
    <MyNetworkPageView
      myNetwork={myNetwork}
      bounties={bounties}
      updateEditingNetwork={updateEditingNetwork}
    />
  );
}

export default function MyNetworkPage({
  bounties
}: MyNetworkPageProps) {
  return(
    <NetworkSettingsProvider>
      <MyNetwork bounties={bounties} />
    </NetworkSettingsProvider>
  );
}
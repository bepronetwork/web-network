import { ReactElement, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";

import { Curator } from "interfaces/curators";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

import VotingPowerMultiNetworkView from "./view";

export default function VotingPowerMultiNetwork() {
  const { push } = useRouter();

  const [networks, setNetworks] = useState<Curator[]>([]);
  const [network, setNetwork] = useState<Curator>();

  const { state } = useAppState();
  const { searchCurators } = useApi();
  const { getURLWithNetwork } = useNetwork();

  function goToNetwork(network) {
    push(getURLWithNetwork("/bounties", {
          network: network?.name,
          chain: network?.chain?.chainShortName,
    }));
    
  }

  function handleNetwork(network: Curator) {
    setNetwork(network)
  }

  function handleIconNetwork(icon: string, color: string): string | ReactElement {
    const  className = "mx-1 circle-3"

    const SecondaryIconProps = color ? {
      className,
      style: { backgroundColor: color }
    }: { className: `${className} bg-primary`}

    return icon ? icon : (
      <div {...SecondaryIconProps} />
    )
  }

  function clearNetwork() {
    setNetwork(undefined)
  }

  useEffect(() => {
    if (state.currentUser?.walletAddress)
      searchCurators({
        address: state.currentUser?.walletAddress,
      })
        .then(({ rows }) => setNetworks(rows))
        .catch((error) =>
          console.debug("Failed to fetch voting power data", error));
  }, [state.currentUser?.walletAddress]);

  return (
    <VotingPowerMultiNetworkView
      networks={networks}
      network={network}
      handleNetwork={handleNetwork}
      clearNetwork={clearNetwork}
      goToNetwork={goToNetwork}
      handleIconNetwork={handleIconNetwork}
    />
  );
}

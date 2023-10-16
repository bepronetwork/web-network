import { ReactElement, useState } from "react";

import { useRouter } from "next/router";

import VotingPowerMultiNetworkView from "components/profile/pages/voting-power/multi-network/view";

import { useAppState } from "contexts/app-state";

import { Curator } from "interfaces/curators";

import { useSearchCurators } from "x-hooks/api/curator";
import { useNetwork } from "x-hooks/use-network";
import useReactQuery from "x-hooks/use-react-query";

export default function VotingPowerMultiNetwork() {
  const { push } = useRouter();

  const [network, setNetwork] = useState<Curator>();

  const { state } = useAppState();
  const { getURLWithNetwork } = useNetwork();

  function getNetworksVotingPower() {
    return useSearchCurators({
      address: state.currentUser?.walletAddress,
    })
      .then(({ rows }) => rows);
  }

  const { data: networks } = useReactQuery( ["voting-power-multi", state.currentUser?.walletAddress],
                                            getNetworksVotingPower,
                                            { enabled: !!state.currentUser?.walletAddress });

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

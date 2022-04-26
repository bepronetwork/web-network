import { useContext, useEffect } from "react";

import getConfig from "next/config";

import Button from "components/button";
import Indicator from "components/indicator";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { changeNetwork } from "contexts/reducers/change-network";
import { changeNetworkId } from "contexts/reducers/change-network-id";

import { NetworkColors, NetworkIds } from "interfaces/enums/network-ids";

const { publicRuntimeConfig } = getConfig()

export default function NetworkIdentifier() {
  const {
    state: { network },
    dispatch
  } = useContext(ApplicationContext);

  const { wallet } = useAuthentication();

  function updateNetwork() {
    if (!wallet?.address) return;

    const chainId = (window as any)?.ethereum?.chainId;
    dispatch(changeNetworkId(+chainId));
    dispatch(changeNetwork((NetworkIds[+chainId] || "unknown")?.toLowerCase()));
  }

  useEffect(updateNetwork, [wallet?.address]);

  return (
    (network && (
      <>
        <Button className="px-3 py-2 rounded pe-none bg-white bg-opacity-10">
          <Indicator bg={NetworkColors[network]} />{" "}
          <span>
            {network}{" "}
            {(network !==
              publicRuntimeConfig.metaMask.chainName.toLowerCase() &&
              "testnet") ||
              ""}
          </span>
        </Button>
      </>
    )) || <></>
  );
}

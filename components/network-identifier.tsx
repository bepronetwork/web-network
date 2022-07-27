import { useContext, useEffect } from "react";

import getConfig from "next/config";

import Indicator from "components/indicator";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { changeNetwork } from "contexts/reducers/change-network";
import { changeNetworkId } from "contexts/reducers/change-network-id";

import { NetworkColors } from "interfaces/enums/network-colors";

const { publicRuntimeConfig } = getConfig();

export default function NetworkIdentifier() {
  const {
    state: { network },
    dispatch
  } = useContext(ApplicationContext);

  const { wallet } = useAuthentication();

  function updateNetwork() {
    if (!wallet?.address) return;

    const chainId = window?.ethereum?.chainId;
    dispatch(changeNetworkId(+chainId));
    dispatch(changeNetwork((publicRuntimeConfig?.networkIds[+chainId] || "unknown")?.toLowerCase()));
  }

  useEffect(updateNetwork, [wallet?.address]);

  return (
    (network && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={NetworkColors[network]} />
        <span className="caption-small text-white-50 ">
          {network}{" "}
          {(network !==
            publicRuntimeConfig?.metaMask?.chainName?.toLowerCase() &&
            "testnet") ||
            ""}
        </span>
      </div>
    )) || <></>
  );
}

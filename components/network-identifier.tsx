import { useContext, useEffect } from "react";

import Indicator from "components/indicator";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { changeNetwork } from "contexts/reducers/change-network";
import { changeNetworkId } from "contexts/reducers/change-network-id";
import { useSettings } from "contexts/settings";

import { NetworkColors } from "interfaces/enums/network-colors";

export default function NetworkIdentifier() {
  const {
    state: { network },
    dispatch
  } = useContext(ApplicationContext);

  const { settings } = useSettings();
  const { wallet } = useAuthentication();

  function updateNetwork() {
    const chainId = window?.ethereum?.chainId;
    
    dispatch(changeNetworkId(+chainId));
    dispatch(changeNetwork((settings?.chainIds && settings?.chainIds[+chainId] || "unknown")?.toLowerCase()));
  }

  useEffect(updateNetwork, [wallet?.address]);

  return (
    (network && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={NetworkColors[network]} />
        <span className="caption-small text-white-50 ">
          {network}
        </span>
      </div>
    )) || <></>
  );
}

import { ContextualSpan } from "components/contextual-span";
import { NewNetworkStepper } from "components/custom-network/new-network-stepper";

import { Network } from "interfaces/network";

interface NetworkSetupProps { 
  isVisible?: boolean;
  defaultNetwork?: Network;
}

export function NetworkSetup({
  isVisible,
  defaultNetwork
} : NetworkSetupProps) {
  
  if (!isVisible)
    return <></>;

  return(
    <div className="content-wrapper border-top-0 px-2 py-2">
      { !!defaultNetwork &&
        <ContextualSpan context="primary" isAlert>
          <span>Default Network already saved, please visit {defaultNetwork.name} settings page.</span>
        </ContextualSpan> ||
        <NewNetworkStepper />
      }
    </div>
  );
}
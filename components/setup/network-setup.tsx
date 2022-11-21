import { useTranslation } from "next-i18next";

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
  const { t } = useTranslation("setup");
  
  if (!isVisible)
    return <></>;

  return(
    <div className="content-wrapper border-top-0 px-2 py-2">
      { !!defaultNetwork &&
        <ContextualSpan context="primary" isAlert>
          <span>{t("network.errors.network-already-saved", { network: defaultNetwork?.name })}</span>
        </ContextualSpan> ||
        <NewNetworkStepper />
      }
    </div>
  );
}
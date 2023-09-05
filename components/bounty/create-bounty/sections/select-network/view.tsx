import { useTranslation } from "next-i18next";

import CreateBountyNetworkDropdown from "components/bounty/create-bounty/create-bounty-network-dropdown";
import { ContextualSpan } from "components/contextual-span";
import If from "components/If";
import SelectChainDropdown from "components/select-chain-dropdown";

import { Network } from "interfaces/network";
import { SupportedChainData } from "interfaces/supported-chain-data";

export interface SelectNetworkSectionProps {
  currentNetwork: Network;
  networksOfCurrentChain: Network[];
  onChainChange: (chain: SupportedChainData) => void;
  onNetworkChange: (network: Network) => void;
}

export default function SelectNetworkSection({
  currentNetwork,
  networksOfCurrentChain,
  onChainChange,
  onNetworkChange,
}: SelectNetworkSectionProps) {
  const { t } = useTranslation(["bounty", "common"]);

  const notFoundNetworks = !networksOfCurrentChain?.length;

  return(
    <div className="mt-2">
      <h5>
        {t("steps.select-network")}
      </h5>

      <p className="text-gray-200">
        {t("descriptions.select-network")}
      </p>

      <div className="col-md-6">
        <label className="p mb-2 text-gray-300">
          {t("common:placeholders.select-chain")}
        </label>

        <SelectChainDropdown
          onSelect={onChainChange}
          isOnNetwork={false}
          className="select-network-dropdown w-max-none mb-4"
        />

        <label className="p mb-2 text-gray-300">
          {t("bounty:steps.select-network")}
        </label>

        <CreateBountyNetworkDropdown
          value={currentNetwork}
          networks={networksOfCurrentChain}
          className="select-network-dropdown w-max-none"
          onSelect={onNetworkChange}
        />

        <If condition={notFoundNetworks}>
          <ContextualSpan context="danger" className="my-3">
            {t("bounty:errors.no-networks-chain")}
          </ContextualSpan>
        </If>
      </div>  
    </div>
  );
}
import SelectChainDropdown from "components/select-chain-dropdown";

import { SupportedChainData } from "interfaces/supported-chain-data";

interface ChainSelectorViewProps {
  isOnNetwork: boolean;
  onSelect: (chain: SupportedChainData) => void | Promise<void>;
}

export default function ChainSelectorView({
  isOnNetwork,
  onSelect,
}: ChainSelectorViewProps) {

  return(
    <SelectChainDropdown
      onSelect={onSelect}
      isOnNetwork={isOnNetwork}
      className="select-network-dropdown"
    />
  );
}
import SelectChainDropdown from "components/select-chain-dropdown";

import { SupportedChainData } from "interfaces/supported-chain-data";

interface ChainSelectorViewProps {
  isOnNetwork: boolean;
  onSelect: (chain: SupportedChainData) => void | Promise<void>;
  isFilter?: boolean;
}

export default function ChainSelectorView({
  isOnNetwork,
  isFilter,
  onSelect,
}: ChainSelectorViewProps) {

  return(
    <SelectChainDropdown
      onSelect={onSelect}
      isOnNetwork={isOnNetwork}
      className={isFilter ? null : 'select-network-dropdown'}
    />
  );
}
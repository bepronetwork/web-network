import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {SupportedChainData} from "interfaces/supported-chain-data";

interface SelectNetworkDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
  defaultChain?: SupportedChainData;
}

interface ChainOption {
  label: string;
  value: SupportedChainData;
}

export default function SelectNetworkDropdown({ defaultChain, onSelect }: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");

  const [selected, setSelectedChain] = useState<ChainOption>(null);
  
  const { state: { supportedChains, connectedChain } } = useAppState();

  const chainToOption = (chain: SupportedChainData): ChainOption => ({ value: chain, label: chain.chainName });

  async function selectSupportedChain({value}) {
    const chain = supportedChains?.find(({ chainId }) => +chainId === +value.chainId);

    if (!chain)
      return;

    onSelect(chain);
    setSelectedChain(chainToOption(chain));
  }

  function updateSelectedChainMatchConnected() {
    const chain = 
      supportedChains?.find(({ chainId }) => chainId === (defaultChain ? +defaultChain.chainId : +connectedChain.id));

    if (!chain)
      return;

    sessionStorage.setItem("currentChainId", chain.chainId.toString());

    onSelect(chain);
    setSelectedChain(chainToOption(chain));
  }

  useEffect(updateSelectedChainMatchConnected, [defaultChain, supportedChains, connectedChain?.id]);

  return <ReactSelect 
            options={supportedChains?.map(chainToOption)}
            value={selected}
            onChange={selectSupportedChain}
            placeholder={t("forms.select-placeholder")}
            isDisabled={!supportedChains?.length || !!defaultChain}
          />
}
import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {SupportedChainData} from "interfaces/supported-chain-data";

interface SelectNetworkDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
}

export default function SelectNetworkDropdown({onSelect,}: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");

  const [selected, setSelectedChain] = useState(null);
  
  const { state: { supportedChains, connectedChain } } = useAppState();

  async function selectSupportedChain({value}) {
    const chain = supportedChains?.find(({ chainId }) => chainId === value);

    if (!chain)
      return;

    onSelect(chain);
    setSelectedChain({value: chain, label: chain.chainName})
  }

  function updateSelectedChainMatchConnected() {
    const chain = supportedChains?.find(({ chainId }) => chainId === +connectedChain.id);

    if (!chain)
      return;

    sessionStorage.setItem("currentChainId", chain.chainId.toString());

    setSelectedChain({ value: chain, label: chain.chainName })
  }

  useEffect(updateSelectedChainMatchConnected, [supportedChains, connectedChain?.id]);


  return <ReactSelect options={supportedChains?.map(opt => ({ label: opt.chainName, value: opt.chainId }))}
                      value={selected}
                      onChange={selectSupportedChain}
                      placeholder={t("forms.select-placeholder")}
                      isDisabled={!supportedChains?.length}/>
}
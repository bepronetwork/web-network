import React, {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import {useAppState} from "../contexts/app-state";
import {SupportedChainData} from "../interfaces/supported-chain-data";
import ReactSelect from "./react-select";

interface SelectNetworkDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
}

export default function SelectNetworkDropdown({onSelect,}: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");
  const {state: { supportedChains, connectedChain },} = useAppState();
  const [selected, setSelectedChain] = useState(null);

  async function selectSupportedChain({value}) {
    const chain = supportedChains.find(({chainId}) => chainId === value);
    if (!chain)
      return;

    onSelect(chain);
    setSelectedChain({value: chain, label: chain.chainName})
  }

  function updateSelectedChainMatchConnected() {
    const chain = supportedChains.find(({chainId}) => chainId === +connectedChain.id);
    if (!chain)
      return;

    setSelectedChain({value: chain, label: chain.chainName})
  }

  useEffect(updateSelectedChainMatchConnected, [connectedChain?.id]);


  return <ReactSelect options={supportedChains.map(opt => ({label: opt.chainName, value: opt.chainId}))}
                      value={selected}
                      onChange={selectSupportedChain}
                      placeholder={t("forms.select-placeholder")}
                      isDisabled={!supportedChains?.length}/>
}
import ReactSelect from "./react-select";
import React from "react";
import {useAppState} from "../contexts/app-state";
import {SupportedChainData} from "../interfaces/supported-chain-data";
import {useTranslation} from "next-i18next";

interface SelectNetworkDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
}

export default function SelectNetworkDropdown({onSelect,}: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");
  const {state: { supportedChains },} = useAppState();

  async function selectSupportedChain({value}) {
    const chain = supportedChains.find(({chainId}) => chainId === value);
    if (!chain)
      return;

    onSelect(chain);
  }

  return <ReactSelect options={supportedChains.map(opt => ({label: opt.chainName, value: opt.chainId}))}
                      onChange={selectSupportedChain}
                      placeholder={t("forms.select-placeholder")}
                      isDisabled={!supportedChains?.length}/>
}
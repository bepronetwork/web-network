import React, {useEffect, useState, ReactNode} from "react";

import {useTranslation} from "next-i18next";

import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import Indicator from "components/indicator";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {SupportedChainData} from "interfaces/supported-chain-data";

import useApi from "x-hooks/use-api";

interface SelectNetworkDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
  defaultChain?: SupportedChainData;
  isOnNetwork?: boolean;
  className?: string;
  isDisabled?: boolean;
}

interface ChainOption {
  label: string;
  value: SupportedChainData | Partial<SupportedChainData>;
  preIcon: ReactNode;
  isDisabled?: boolean;
  tooltip?: string;
}

export default function SelectNetworkDropdown({ 
  defaultChain,
  isOnNetwork,
  className = "text-uppercase",
  onSelect,
  isDisabled
}: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");

  const [options, setOptions] = useState<ChainOption[]>([]);
  const [selected, setSelectedChain] = useState<ChainOption>(null);
  const [chainsWithSameNetwork, setChainsWithSameNetwork] = useState<SupportedChainData[]>();
  
  const { searchNetworks } = useApi();
  const { state: { Service, supportedChains, connectedChain } } = useAppState();

  const chainToOption = (chain: SupportedChainData | Partial<SupportedChainData>, isDisabled?: boolean): ChainOption => 
    ({ 
      value: chain, 
      label: chain.chainShortName,
      preIcon: (<Indicator bg={isDisabled ? "gray" : chain.color} />),
      isDisabled,
      tooltip: isDisabled ? "Not available on this chain" : undefined
    });

  async function selectSupportedChain({value}) {
    const chain = supportedChains?.find(({ chainId }) => +chainId === +value.chainId);

    if (!chain)
      return;

    onSelect(chain);
    setSelectedChain(chainToOption(chain));
  }

  function updateSelectedChainMatchConnected() {
    const chain = isOnNetwork ? Service?.network?.active?.chain :
      supportedChains?.find(({ chainId }) => chainId === (defaultChain ? +defaultChain.chainId : +connectedChain.id));

    if (!chain) {
      setSelectedChain(chainToOption({ chainShortName: "Unknown" }));  
      return;
    }

    sessionStorage.setItem("currentChainId", chain.chainId.toString());

    setSelectedChain(chainToOption(chain));
  }

  function updateChainsWithSameNetwork() {
    if (isOnNetwork !== true || !Service?.network?.active?.name) {
      setChainsWithSameNetwork(undefined);
      return;
    }

    searchNetworks({
      name: Service?.network?.active?.name
    })
      .then(({ count, rows }) => {
        if (count === 0)
          setChainsWithSameNetwork(undefined);
        else
          setChainsWithSameNetwork(rows.map(row => row.chain));
      })
      .catch(console.debug);
  }

  function updateOptions() {
    if (!supportedChains || (isOnNetwork && !chainsWithSameNetwork)) return;

    if (isOnNetwork)
      setOptions(supportedChains.map(chain => 
        chainToOption(chain, !chainsWithSameNetwork?.find(({ chainId }) => chainId === chain.chainId))));
    else
      setOptions(supportedChains.map(chain => chainToOption(chain)));
  }

  useEffect(updateOptions, [isOnNetwork, chainsWithSameNetwork, supportedChains]);
  useEffect(updateChainsWithSameNetwork, [isOnNetwork, Service?.network?.active?.name]);
  useEffect(updateSelectedChainMatchConnected, [
    defaultChain,
    isOnNetwork,
    Service?.network?.active?.chain,
    supportedChains,
    connectedChain?.id
  ]);

  return(
    <div className={className}>
      <ReactSelect 
        options={options}
        value={selected}
        onChange={selectSupportedChain}
        placeholder={t("forms.select-placeholder")}
        isDisabled={isDisabled || !supportedChains?.length || !!defaultChain}
        readOnly={true}
        components={{
          Option: IconOption,
          SingleValue: IconSingleValue
        }}
      />
    </div>
  );
}
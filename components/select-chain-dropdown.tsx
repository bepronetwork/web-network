import React, {ReactNode, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ChainIcon from "components/chain-icon";
import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {SupportedChainData} from "interfaces/supported-chain-data";

import {getChainIcon, getChainIconsList} from "services/chain-id";

import useBreakPoint from "x-hooks/use-breakpoint";

interface SelectChainDropdownProps {
  onSelect: (chain: SupportedChainData) => void;
  defaultChain?: SupportedChainData;
  isOnNetwork?: boolean;
  className?: string;
  isDisabled?: boolean;
  placeHolder?: string;
  shouldMatchChain?: boolean;
  readonly?: boolean;
}

interface ChainOption {
  label: string;
  value: SupportedChainData | Partial<SupportedChainData>;
  preIcon: ReactNode;
  isDisabled?: boolean;
  tooltip?: string;
}

export default function SelectChainDropdown({
  defaultChain,
  isOnNetwork,
  className = "text-uppercase",
  onSelect,
  isDisabled,
  placeHolder,
  shouldMatchChain = true,
  readonly,
}: SelectChainDropdownProps) {
  const { t } = useTranslation("common");

  const [options, setOptions] = useState<ChainOption[]>([]);
  const [selected, setSelectedChain] = useState<ChainOption>(null);

  const { isDesktopView } = useBreakPoint();
  const { state: { Service, supportedChains, connectedChain, currentUser, spinners } } = useAppState();

  const placeholder = 
    !shouldMatchChain ? t("misc.all-chains") : placeHolder ? placeHolder : t("forms.select-placeholder");

  function chainToOption(chain: SupportedChainData | Partial<SupportedChainData>, isDisabled?: boolean): ChainOption {
    return {
      value: chain,
      label: chain.chainShortName,
      preIcon: (<ChainIcon src={chain.icon} />),
      isDisabled,
      tooltip: isDisabled
      ? t("errors.not-available-chain")
      : chain?.chainShortName?.length > 12
      ? chain.chainShortName
      : undefined,
    };
  }

  function isChainConfigured({ registryAddress }: SupportedChainData) {
    return currentUser?.isAdmin || !!registryAddress;
  }

  async function selectSupportedChain({value}) {
    if (readonly) return;

    const chain = supportedChains?.find(({ chainId }) => +chainId === +value.chainId);

    if (!chain || chain?.chainId === selected?.value?.chainId)
      return;

    onSelect(chain);
    setSelectedChain(chainToOption(chain));
  }

  function updateSelectedChainMatchConnected() {
    if (!shouldMatchChain) {
      setSelectedChain(null);
      return;
    }

    let chain = undefined;

    if (isOnNetwork && Service?.network?.active?.chain)
      chain = 
        options?.find(({ value: { chainId } }) => chainId === +(Service?.network?.active?.chain?.chainId))?.value;
    else
      chain =
        options?.find(({ value: { chainId } }) => chainId === +(defaultChain?.chainId || connectedChain.id))?.value;

    if (!chain) {
      setSelectedChain(null);
      return;
    }

    sessionStorage.setItem("currentChainId", chain.chainId.toString());

    setSelectedChain(chainToOption(chain));
  }

  async function updateOptions() {
    if (!supportedChains || (isOnNetwork && !Service?.network?.availableChains)) return;

    await getChainIconsList(); // request the chainsIconsList so we don't do it on the loop

    const chainsWithIcon = await Promise.all(supportedChains
      .filter(isChainConfigured)
      .map(async (chain) => ({
        ...chain,
        icon: await getChainIcon(chain.icon)
      })));

    if (isOnNetwork)
      setOptions(chainsWithIcon.map(chain =>
        chainToOption(chain, !Service?.network?.availableChains?.find(({ chainId }) => chainId === chain.chainId))));
    else
      setOptions(chainsWithIcon.map(chain => chainToOption(chain)));
  }

  function getNativeOptions() {
    return options.map((opt, index) => ({
      label: opt?.label,
      value: index,
    }));
  }

  function onNativeChange(selectedOption) {
    selectSupportedChain(options[selectedOption?.value]);
  }

  useEffect(() => {
    updateOptions();
  }, [
    isOnNetwork,
    Service?.network?.availableChains,
    supportedChains,
    currentUser?.isAdmin
  ]);

  useEffect(updateSelectedChainMatchConnected, [
    options,
    Service?.network?.active?.chain,
    connectedChain?.id,
    spinners,
    shouldMatchChain
  ]);

  return(
    <NativeSelectWrapper
      options={getNativeOptions()}
      onChange={onNativeChange}
    >
      <div className={className}>
        <ReactSelect
          menuPlacement={isDesktopView ? "auto" : "top"}
          options={options}
          value={selected}
          onChange={selectSupportedChain}
          placeholder={placeholder}
          isDisabled={isDisabled || !supportedChains?.length || !!defaultChain}
          isSearchable={false}
          readOnly={true}
          components={{
            Option: IconOption,
            SingleValue: IconSingleValue
          }}
        />
      </div>
    </NativeSelectWrapper>
  );
}
import React, { useEffect, useState, ReactNode } from "react";

import { useTranslation } from "next-i18next";

import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import ReactSelect from "components/react-select";

import { useAppState } from "contexts/app-state";

import { Network } from "interfaces/network";

interface SelectNetworkDropdownProps {
  onSelect: (network: Network) => void;
  networks: Network[];
  className?: string;
  isDisabled?: boolean;
  placeHolder?: string;
}

interface NetworkOption {
  label: string;
  value: string;
  preIcon: ReactNode;
  isDisabled?: boolean;
  tooltip?: string;
}

export default function SelectNetworkDropdown({
  networks,
  className = "text-uppercase",
  onSelect,
  isDisabled,
  placeHolder,
}: SelectNetworkDropdownProps) {
  const { t } = useTranslation("common");

  const [options, setOptions] = useState<NetworkOption[]>([]);
  const [selected, setSelectedChain] = useState<NetworkOption>(null);
  const {
    state: { Settings: settings },
  } = useAppState();

  function chainToOption(network: Network | Partial<Network>,
                         isDisabled?: boolean): NetworkOption {
    return {
      value: network.name,
      label: network.name,
      preIcon: (
        <img
          src={`${settings?.urls?.ipfs}/${network?.logoIcon}`}
          alt={`${network?.name} logo`}
          width={16}
          height={16}
        />
      ),
      isDisabled,
      tooltip: network.name,
    };
  }

  async function selectSupportedNetwork({ value }) {
    console.log("select - value", value);
    const network = networks.find((network) => network.name === value);

    onSelect(network);
    setSelectedChain(chainToOption(network));
  }

  function updateOptions() {
    if (networks.length > 0) {
      setOptions(networks.map((network) => ({
          value: network?.name,
          label: network?.name,
          preIcon: (
            <img
              src={`${settings?.urls?.ipfs}/${network?.logoIcon}`}
              alt={`${network?.name} logo`}
              width={16}
              height={16}
            />
          ),
          isDisabled: false,
          tooltip: network?.name,
      })));
    }
  }

  useEffect(updateOptions, [networks]);

  return (
    <div className={className}>
      <ReactSelect
        options={options}
        value={selected}
        onChange={selectSupportedNetwork}
        placeholder={placeHolder ? placeHolder : t("forms.select-placeholder")}
        isDisabled={isDisabled}
        readOnly={true}
        components={{
          Option: IconOption,
          SingleValue: IconSingleValue,
        }}
      />
    </div>
  );
}

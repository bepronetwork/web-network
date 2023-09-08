import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import NetworkLogo from "components/network-logo";
import ReactSelect from "components/react-select";

import { useAppState } from "contexts/app-state";

import { isOnNetworkPath } from "helpers/network";

import { Network } from "interfaces/network";

import { useSearchNetworks } from "x-hooks/api/network";
import useChain from "x-hooks/use-chain";
import useReactQuery from "x-hooks/use-react-query";

interface SelectNetworkProps {
  isCurrentDefault?: boolean;
  onlyProfileFilters?: boolean;
  filterByConnectedChain?: boolean;
}

export default function SelectNetwork({
  isCurrentDefault = false,
  onlyProfileFilters = false,
  filterByConnectedChain = false
} : SelectNetworkProps) {
  const { t } = useTranslation("common");
  const { query, pathname, asPath, push } = useRouter();

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(undefined);

  const { chain } = useChain();
  const { state } = useAppState();

  const chainIdToFilter = filterByConnectedChain || !isOnNetworkPath(pathname) ? 
    state.connectedChain?.id : chain?.chainId?.toString();

  const { data: networks } = useReactQuery( ["networks", chainIdToFilter], 
                                            () => useSearchNetworks({ chainId: chainIdToFilter }),
                                            {
                                              enabled: !!chainIdToFilter
                                            });

  function networkToOption(network: Network) {
    return {
      label: network.name,
      value: network,
      preIcon: (
        <NetworkLogo
          src={`${state.Settings?.urls?.ipfs}/${network?.logoIcon}`}
          alt={`${network?.name} logo`}
          isBepro={network?.name.toLowerCase() === 'bepro'}
          size="sm"
          noBg
        />
      )
    };
  }

  function onChange(newValue) {
    if (!newValue || newValue?.value?.networkAddress !== selected?.value?.networkAddress) {
      setSelected(newValue);

      const newQuery = {
        ...query,
        page: "1",
        networkName: newValue?.value?.name || null
      };

      push({ pathname: pathname, query: newQuery }, asPath);
    }
  }

  function handleSelectedWithNetworkName(options) {
    const opt = options?.find(({ value }) => value?.name === query?.networkName)
    if(opt) setSelected(opt)
  }

  useEffect(() => {
    const options = networks?.rows?.map(networkToOption);
    setOptions(options || [])
    handleSelectedWithNetworkName(options);
  }, [networks]);

  useEffect(() => {
    if (state.Service?.network?.active && !selected && isCurrentDefault)
      setSelected(networkToOption(state.Service?.network?.active));
  }, [isCurrentDefault, state.Service?.network?.active]);

  return(
    <div className={`${onlyProfileFilters ? 'mb-3' : 'd-flex align-items-center'}`}>
      <span className='caption-small font-weight-medium text-gray-100 text-nowrap mr-1'>
        {t("misc.network")}
      </span>
      <NativeSelectWrapper
        options={options}
        onChange={onChange}
        selectedIndex={options?.findIndex((opt) =>
            opt?.value?.networkAddress === selected?.value?.networkAddress)}
      >
        <ReactSelect
          value={selected}
          options={options}
          onChange={onChange}
          placeholder={t("select-a-network")}
          components={{
            Option: IconOption,
            SingleValue: IconSingleValue,
          }}
          isClearable
        />
      </NativeSelectWrapper>
    </div>
  );
}
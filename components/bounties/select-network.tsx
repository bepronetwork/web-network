import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import NetworkLogo from "components/network-logo";
import ReactSelect from "components/react-select";

import { useAppState } from "contexts/app-state";

import { Network } from "interfaces/network";

import { WinStorage } from "services/win-storage";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";

interface SelectNetworkProps {
  isCurrentDefault?: boolean;
}

export default function SelectNetwork({
  isCurrentDefault = false
} : SelectNetworkProps) {
  const { t } = useTranslation("common");
  const { query, pathname, asPath, push } = useRouter();

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(undefined);

  const { chain } = useChain();
  const { state } = useAppState();
  const { searchNetworks } = useApi();

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
        networkName: newValue?.value?.name || "all"
      };

      push({ pathname: pathname, query: newQuery }, asPath);
    }
  }

  useEffect(() => {
    if (!chain && isCurrentDefault) return;

    const cache = new WinStorage(`networks:${chain?.chainId}`, 60000, "sessionStorage");

    if (cache.value)
      setOptions(cache.value.map(networkToOption));
    else
      searchNetworks({
        chainId: chain?.chainId?.toString()
      })
        .then(({ rows }) => setOptions(rows.map(networkToOption)));
  }, [chain, isCurrentDefault]);

  useEffect(() => {
    if (state.Service?.network?.active && !selected && isCurrentDefault)
      setSelected(networkToOption(state.Service?.network?.active));
  }, [isCurrentDefault, state.Service?.network?.active]);

  return(
    <div className="d-flex align-items-center">
      <span className="caption text-gray-500 text-nowrap mr-1 font-weight-normal">
        {t("misc.network")}
      </span>

      <ReactSelect
        value={selected}
        options={options}
        onChange={onChange}
        placeholder="Select a network"
        components={{
          Option: IconOption,
          SingleValue: IconSingleValue
        }}
        isClearable
      />
    </div>
  );
}
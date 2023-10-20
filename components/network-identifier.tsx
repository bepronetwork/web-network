import {useEffect} from "react";

import { useTranslation } from "next-i18next";

import Indicator from "components/indicator";

import {useAppState} from "contexts/app-state";
import {changeChain} from "contexts/reducers/change-chain";
import { changeMissingMetamask } from "contexts/reducers/update-show-prop";

import { SUPPORT_LINK, UNSUPPORTED_CHAIN } from "helpers/constants";
import handleEthereumProvider from "helpers/handle-ethereum-provider";

import {NetworkColors} from "interfaces/enums/network-colors";

export default function NetworkIdentifier() {
  const { t } = useTranslation("common");

  const {state, dispatch} = useAppState();

  function findChain(windowChainId: number) {
    return state.supportedChains?.find(({chainId}) => chainId === windowChainId)
  }

  function dispatchChainUpdate(chainId: number) {
    const chain = findChain(chainId);

    sessionStorage.setItem("currentChainId", chainId.toString());
    
    return dispatch(changeChain.update({
      id: (chain?.chainId || chainId)?.toString(),
      name: chain?.chainName || UNSUPPORTED_CHAIN,
      shortName: chain?.chainShortName?.toLowerCase() || UNSUPPORTED_CHAIN,
      explorer: chain?.blockScanner || SUPPORT_LINK,
      events: chain?.eventsApi,
      registry: chain?.registryAddress
    }));
  }

  useEffect(() => {
    if (!window.ethereum || !state.supportedChains?.length)
      return;

    handleEthereumProvider(dispatchChainUpdate, () => dispatch(changeMissingMetamask(true)))
  }, [state.supportedChains]);

  return (
    (state.connectedChain?.name && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={findChain(+state.connectedChain?.id)?.color || NetworkColors[state.connectedChain?.name]} />
        <span className="caption-small text-white-50 ">
          {state.connectedChain?.name === UNSUPPORTED_CHAIN ? t("misc.unsupported") : state.connectedChain?.name}
        </span>
      </div>
    )) || <></>
  );
}

import {useEffect} from "react";

import Indicator from "components/indicator";

import {useAppState} from "contexts/app-state";
import {changeChain} from "contexts/reducers/change-chain";

import {NetworkColors} from "interfaces/enums/network-colors";

export default function NetworkIdentifier() {
  const {state, dispatch} = useAppState();

  function findChain(windowChainId: number) {
    return state.supportedChains?.find(({chainId}) => chainId === windowChainId)
  }

  function dispatchChainUpdate(chainId: number) {
    const chain = findChain(chainId);

    sessionStorage.setItem("currentChainId", chainId.toString());
    
    return dispatch(changeChain.update({
      id: (chain?.chainId || chainId)?.toString(),
      name: chain?.chainName || "unsupported",
      shortName: chain?.chainShortName?.toLowerCase() || "unsupported",
      explorer: chain?.blockScanner,
      events: chain?.eventsApi,
      registry: chain?.registryAddress
    }));
  }

  useEffect(() => {
    if (!window.ethereum || !state.supportedChains?.length)
      return;

    window.ethereum.removeAllListeners(`chainChanged`);

    if (window.ethereum.isConnected())
      dispatchChainUpdate(+window.ethereum.chainId);

    window.ethereum.on(`connected`, evt => {
      console.debug(`Metamask connected`, evt);
    });

    window.ethereum.on(`chainChanged`, evt => {
      dispatchChainUpdate(+evt);
    });

  }, [state.supportedChains]);

  return (
    (state.connectedChain?.name && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={findChain(+state.connectedChain?.id)?.color || NetworkColors[state.connectedChain?.name]} />
        <span className="caption-small text-white-50 ">
          {state.connectedChain?.name}
        </span>
      </div>
    )) || <></>
  );
}

import {useEffect} from "react";

import Indicator from "components/indicator";

import {NetworkColors} from "interfaces/enums/network-colors";

import {useAppState} from "../contexts/app-state";
import {changeChain} from "../contexts/reducers/change-chain";

export default function NetworkIdentifier() {
  const {state, dispatch} = useAppState();

  function findChain(windowChainId: number) {
    return state.supportedChains?.find(({chainId}) => chainId === windowChainId)
  }

  useEffect(() => {
    if (!window.ethereum && !state.supportedChains?.length)
      return;

    window.ethereum.removeAllListeners(`chainChanged`);

    if (window.ethereum.isConnected()) {
      const windowChainId = +window.ethereum.chainId;
      const chain = findChain(windowChainId);

      dispatch(changeChain.update({
        id: (chain?.chainId || windowChainId).toString(),
        name: chain?.chainName || 'unknown',
        explorer: chain?.blockScanner,
        events: chain?.eventsApi,
      }))
    }

    window.ethereum.on(`connected`, evt => {
      console.debug(`Metamask connected`, evt);
    });

    window.ethereum.on(`chainChanged`, evt => {
      const chain = findChain(+evt);
      dispatch(changeChain.update({
        id: (chain?.chainId || evt)?.toString(),
        name: chain?.chainName || 'unknown',
        explorer: chain?.blockScanner,
        events: chain?.eventsApi,
      }))
    });

  }, [state.supportedChains]);

  return (
    (state.connectedChain?.name && (
      <div className="ml-2 bg-transparent p-0 d-flex flex-row align-items-center justify-content-center">
        <Indicator bg={NetworkColors[state.connectedChain?.name] || "gray"} />
        <span className="caption-small text-white-50 ">
          {state.connectedChain?.name}
        </span>
      </div>
    )) || <></>
  );
}

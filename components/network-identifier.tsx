import {useEffect} from "react";

import Indicator from "components/indicator";

import {NetworkColors} from "interfaces/enums/network-colors";

import {useAppState} from "../contexts/app-state";
import {changeChain} from "../contexts/reducers/change-chain";

export default function NetworkIdentifier() {
  const {state, dispatch} = useAppState();


  useEffect(() => {
    if (!window.ethereum)
      return;

    window.ethereum.removeAllListeners(`chainChanged`);

    if (window.ethereum.isConnected()) {
      console.debug(`was connected`);
      dispatch(changeChain.update({
        id: (+window.ethereum.chainId)?.toString(),
        name: state.Settings?.chainIds[(+window.ethereum.chainId)?.toString() || 'unknown']
      }))
    }

    window.ethereum.on(`connected`, evt => {
      console.debug(`Metamask connected`, evt);
    });

    window.ethereum.on(`chainChanged`, evt => {
      console.debug(`chainChanged`, evt);
      dispatch(changeChain.update({
        id: (+evt)?.toString(),
        name: state.Settings?.chainIds[(+evt)?.toString() || 'unknown']
      }))
    });

  }, []);


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

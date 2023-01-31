import {useAppState} from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import decodeMessage from "helpers/decode-message";
import {messageFor} from "helpers/message-for";

export default function useSignature() {

  const {dispatch, state: {connectedChain, Service, currentUser}} = useAppState();

  async function signMessage(message = ""): Promise<string> {
    if ((!Service?.active && !window.ethereum) || !currentUser?.walletAddress)
      return;

    const payload = {
      method: `eth_signTypedData_v4`,
      from: currentUser.walletAddress,
      params: [
        currentUser.walletAddress, messageFor(connectedChain?.id, message)
      ]
    }

    return new Promise((res, rej) => {
      const _promise = (err, d) => { 
        if (!err)
          return res(d?.result);
        
        console.debug("Failed to sign message", err);

        dispatch(addToast({
          type: "danger",
          title: "Failed",
          content: "Signed message required to proceed",
        }));

        return res(undefined);
      };

      if (Service.active?.web3Connection?.Web3?.currentProvider?.hasOwnProperty("sendAsync"))
        Service.active?.web3Connection.Web3.currentProvider.sendAsync(payload, _promise);
      else if (window.ethereum) 
        window.ethereum.request(payload).then(v => _promise(null, {result: v})).catch(e => _promise(e, null));
    });
  }

  return {
    signMessage,
    messageFor,
    decodeMessage,
  }
}
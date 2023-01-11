import {useAppState} from "../contexts/app-state";
import decodeMessage from "../helpers/decode-message";
import {messageFor} from "../helpers/message-for";

export default function useSignature() {

  const {state: {connectedChain, Service, currentUser}} = useAppState();

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
      const _promise = (err, d) => { err ? rej(err) : res(d?.result) };

      if (Service.active)
        Service.active?.web3Connection.Web3.currentProvider.sendAsync(payload, _promise);
      else if (window.ethereum) window.ethereum.request(payload).then(v => _promise(null, {result: v})).catch(e => _promise(e, null))
    });
  }

  return {
    signMessage,
    messageFor,
    decodeMessage,
  }
}
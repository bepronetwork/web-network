import {useAppState} from "../contexts/app-state";
import {messageFor} from "../helpers/message-for";
import decodeMessage from "../helpers/decode-message";

export default function useSignature() {

  const {state: {connectedChain, Service, currentUser}} = useAppState();

  async function signMessage(message = ""): Promise<string> {
    if (!Service?.active || !currentUser?.walletAddress)
      return;

    const payload = {
      method: `eth_signTypedData_v4`,
      from: currentUser.walletAddress,
      params: [
        currentUser.walletAddress, messageFor(connectedChain?.id, message)
      ]
    }

    return new Promise((res, rej) => {
      Service.active?.web3Connection.Web3.currentProvider.sendAsync(payload, (err, d) => { err ? rej(err) : res(d?.result) });
    });
  }

  return {
    signMessage,
    messageFor,
    decodeMessage,
  }
}
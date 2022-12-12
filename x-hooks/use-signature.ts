import {useAppState} from "../contexts/app-state";

export default function useSignature() {

  const {state: {connectedChain, Service, currentUser}} = useAppState();

  function messageFor(chainId, contents = "Hello, world") {
    return JSON.stringify({
      domain: {
        chainId: +chainId,
        name: 'BEPRO-Message',
        version: '1',
      },
      message: {
        contents,
      },
      primaryType: 'Message',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Message: [
          {name: 'contents', type: 'string'}
        ]
      }
    })
  }

  async function signMessage(message = ""): Promise<string> {
    if (!Service.active || !currentUser?.walletAddress)
      return;

    const payload = {
      method: `eth_signTypedData_v4`,
      from: currentUser.walletAddress,
      params: [
        currentUser.walletAddress, messageFor(connectedChain?.id, message)
      ]
    }

    return new Promise((res, rej) => {
      const resolver = (err, d) => { err ? rej(err) : res(d?.result) };
      Service.active?.web3Connection.Web3.currentProvider.sendAsync(payload, resolver);
    });
  }

  return {
    signMessage,
    messageFor,
  }
}
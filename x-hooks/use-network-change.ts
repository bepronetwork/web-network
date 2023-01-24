import {SupportedChainData} from "interfaces/supported-chain-data";

export default function UseNetworkChange() {
  async function handleAddNetwork(chosenSupportedChain: SupportedChainData) {
    const chainId = `0x${Number(chosenSupportedChain.chainId).toString(16)}`;

    return window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chainId,
        },
      ],
    }).catch(error => {
      if ((error as any)?.message?.indexOf('wallet_addEthereumChain') > -1) {
        return window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainId,
              chainName: chosenSupportedChain.chainName,
              nativeCurrency: {
                name: chosenSupportedChain.chainCurrencyName,
                symbol: chosenSupportedChain.chainCurrencySymbol,
                decimals: chosenSupportedChain.chainCurrencyDecimals,
              },
              rpcUrls: [chosenSupportedChain.chainRpc],
              blockExplorerUrls: [chosenSupportedChain.blockScanner],
            },
          ],
        }).catch(e => {
          throw new Error(e)
        })
      }

      throw new Error(error);
    })

  }

  return {
    handleAddNetwork
  }
}
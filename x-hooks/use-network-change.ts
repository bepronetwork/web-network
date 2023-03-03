import {toHex} from "web3-utils";

import { useAppState } from "contexts/app-state";
import { changeSpinners } from "contexts/reducers/change-spinners";

import {SupportedChainData} from "interfaces/supported-chain-data";

export default function useNetworkChange() {
  const { dispatch } = useAppState();
  
  async function handleAddNetwork(chosenSupportedChain: SupportedChainData) {
    const chainId = toHex(chosenSupportedChain.chainId);

    dispatch(changeSpinners.update({ switchingChain: true }));

    return window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chainId,
        },
      ],
    })
      .catch(error => {
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
            throw new Error(e);
          })
        }

        throw new Error(error);
      })
      .finally(() => dispatch(changeSpinners.update({ switchingChain: false })))
  }

  return {
    handleAddNetwork
  };
}
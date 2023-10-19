export default function handleEthereumProvider(handleChainUpdate: (v: number) => void,
                                               handleError: () => void) {
  try {
    window.ethereum.removeAllListeners(`chainChanged`);

    if (window.ethereum?.isConnected())
      handleChainUpdate(+window.ethereum.chainId);

    window.ethereum.on(`connected`, (evt) => {
      console.debug(`Metamask connected`, evt);
    });

    window.ethereum.on(`chainChanged`, (evt) => {
      handleChainUpdate(+evt);
    });
  } catch (err) {
    const regex = /isConnected is not a function/g;

    if (regex.test(err?.message)) {
      const newProvider = (window.ethereum as any)?.selectedProvider //eslint-disable-line

      if (newProvider) {
        if(newProvider?.isMetaMask !== undefined && !newProvider?.isMetaMask) handleError()

        if (newProvider.isConnected())
          handleChainUpdate(+window.ethereum.chainId);

        newProvider.removeAllListeners(`chainChanged`);

        newProvider.on(`chainChanged`, (evt) => {
          handleChainUpdate(+evt);
        });
      }
    }

    console.debug("window.ethereum errors", err);
  }
}

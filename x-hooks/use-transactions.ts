import { useAppState } from "contexts/app-state";
import { setTxList } from "contexts/reducers/change-tx-list";

import { BlockTransaction, SimpleBlockTransactionPayload, UpdateBlockTransaction } from "interfaces/transaction";

import { WinStorage } from "services/win-storage";

export function useTransactions() {
  const { dispatch } = useAppState();

  const getStorageKey = (walletAddress: string, chainId: string) => `bepro.transactions:${walletAddress}:${chainId}`;

  function checkRequirements(fn: (wallet, chainId) => void) {
    const walletAddress = sessionStorage.getItem("currentWallet");
    const chainId = sessionStorage.getItem("currentChainId");

    if (!walletAddress) return;

    fn(walletAddress, chainId);
  }

  function deleteFromStorage() {
    checkRequirements((walletAddress, chainId) => {
      const storage = new WinStorage(getStorageKey(walletAddress, chainId), 0, 'localStorage');

      storage.value = undefined;
    });
  }

  function loadFromStorage() {
    checkRequirements((walletAddress, chainId) => {
      const storage = new WinStorage(getStorageKey(walletAddress, chainId), 0, 'localStorage');

      const transactions = JSON.parse(storage.value || "[]");

      dispatch(setTxList(transactions));
    });
  }

  function saveToStorage(transactions: (SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction)[]) {
    checkRequirements((walletAddress, chainId) => {
      const SEVEN_DAYS_IN_MS = 60 * 60 * 24 * 7 * 1000;

      const storage = new WinStorage(getStorageKey(walletAddress, chainId), SEVEN_DAYS_IN_MS, 'localStorage');

      if (JSON.stringify(transactions) === JSON.stringify(storage.value)) return;

      storage.value = JSON.stringify(transactions);
    });
  }

  return {
    loadFromStorage,
    saveToStorage,
    deleteFromStorage
  };
}
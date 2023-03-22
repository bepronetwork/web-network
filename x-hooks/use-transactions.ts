import { useAppState } from "contexts/app-state";
import { setTxList } from "contexts/reducers/change-tx-list";

import { getTransactionsStorageKey } from "helpers/transactions";

import { WinStorage } from "services/win-storage";

export function useTransactions() {
  const { dispatch } = useAppState();

  function checkRequirements(fn: (wallet, chainId) => void) {
    const walletAddress = sessionStorage.getItem("currentWallet")?.toLowerCase();
    const chainId = sessionStorage.getItem("currentChainId");

    if (!walletAddress || !chainId) return;

    fn(walletAddress, chainId);
  }

  function deleteFromStorage() {
    checkRequirements((walletAddress, chainId) => {
      const storage = new WinStorage(getTransactionsStorageKey(walletAddress, chainId), 0, 'localStorage');

      storage.value = undefined;
    });
  }

  function loadFromStorage() {
    checkRequirements((walletAddress, chainId) => {
      const storage = new WinStorage(getTransactionsStorageKey(walletAddress, chainId), 0, 'localStorage');

      const transactions = JSON.parse(storage.value || "[]");

      dispatch(setTxList(transactions));
    });
  }

  return {
    loadFromStorage,
    deleteFromStorage
  };
}
import { useAppState } from "contexts/app-state";
import { setTxList } from "contexts/reducers/change-tx-list";

import { WinStorage } from "services/win-storage";

export function useTransactions() {
  const { state, dispatch } = useAppState();

  const getStorageKey = (walletAddress: string) => `bepro.transactions:${walletAddress}`;

  function checkRequirements(fn: (wallet) => void) {
    const walletAddress = state.currentUser?.walletAddress;

    if (!walletAddress) return;

    fn(walletAddress);
  }


  function deleteFromStorage() {
    checkRequirements((walletAddress) => {
      const storage = new WinStorage(getStorageKey(walletAddress), 0, 'localStorage');

      storage.value = undefined;
    });
  }

  function loadFromStorage() {
    checkRequirements((walletAddress) => {
      const storage = new WinStorage(getStorageKey(walletAddress), 0, 'localStorage');

      if (!storage.value) return;

      const transactions = JSON.parse(storage.value);

      dispatch(setTxList(transactions));
    });
  }

  function saveToStorage() {
    checkRequirements((walletAddress) => {
      const transactions = state.transactions;

      const SEVEN_DAYS_IN_MS = 60 * 60 * 24 * 7 * 1000;

      const storage = new WinStorage(getStorageKey(walletAddress), SEVEN_DAYS_IN_MS, 'localStorage');

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
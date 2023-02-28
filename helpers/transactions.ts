import { SEVEN_DAYS_IN_MS } from "helpers/contants";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { BlockTransaction, SimpleBlockTransactionPayload } from "interfaces/transaction";

import { WinStorage } from "services/win-storage";

export const parseTransaction = (transaction,
  simpleTx?: SimpleBlockTransactionPayload) => {
  return {
    ...simpleTx,
    addressFrom: transaction.from,
    addressTo: transaction.to,
    transactionHash: transaction.transactionHash,
    blockHash: transaction.blockHash,
    confirmations: (simpleTx as BlockTransaction)?.confirmations,
    status: transaction.status
      ? TransactionStatus.completed
      : TransactionStatus.failed
  };
}

export const getTransactionsStorageKey = 
  (walletAddress: string, chainId: string) => `bepro.transactions:${walletAddress}:${chainId}`;

export const saveTransactionsToStorage = (transformed) => {
  const walletAddress = sessionStorage.getItem("currentWallet")?.toLowerCase();
  const chainId = sessionStorage.getItem("currentChainId");

  if (!walletAddress || !chainId) return;

  const storage = new WinStorage(getTransactionsStorageKey(walletAddress, chainId), SEVEN_DAYS_IN_MS, 'localStorage');
  storage.value = JSON.stringify(transformed);
}
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { BlockTransaction, SimpleBlockTransactionPayload } from "interfaces/transaction";

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
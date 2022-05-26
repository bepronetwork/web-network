import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import { Network } from "./network";

export type TransactionCurrency = "Oracles" | "$BEPRO";

export interface SimpleBlockTransactionPayload {
  date: number;
  id: string;
  type: TransactionTypes;
  status: TransactionStatus;
  amount: number;
  currency: string;
  network?: Network;
}

export interface BlockTransaction extends SimpleBlockTransactionPayload {
  confirmations: number;
  blockHash: string;
  transactionHash: string;
  addressFrom: string;
  addressTo: string;
}

export interface UpdateBlockTransaction extends BlockTransaction {
  remove?: boolean;
}

export type Transaction =
  | SimpleBlockTransactionPayload
  | BlockTransaction
  | UpdateBlockTransaction;

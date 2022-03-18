import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import { INetwork } from "./network";

export type TransactionCurrency = "Oracles" | "$BEPRO";

export interface SimpleBlockTransactionPayload {
  date: number;
  id: string;
  type: TransactionTypes;
  status: TransactionStatus;
  amount: number;
  currency: TransactionCurrency;
  network?: INetwork;
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

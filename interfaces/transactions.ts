export type TransactionsStatus = `pending` | `processing` | `approved`;
export type TransactionsType = `create issue` | `lock` | `unlock` | string;
export type TransactionsAmmountType = `Oracles` | `$BEPRO`;

export interface BlockTransactions {
  confirmations: number;
  blockHash: string;
  type?: string;
  transactionHash: string;
  date?: Date;
  addressFrom: string;
  addressTo: string;
}

export interface Transactions extends BlockTransactions {
  status: TransactionsStatus;
  type: TransactionsType;
  date: Date;
  amount: string;
  amountType: TransactionsAmmountType;
}
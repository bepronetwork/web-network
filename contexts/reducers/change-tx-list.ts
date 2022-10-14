import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {BlockTransaction, SimpleBlockTransactionPayload, UpdateBlockTransaction} from "../../interfaces/transaction";
import {State} from "../../interfaces/application-state";
import { v4 as uuidv4 } from "uuid";
import {TransactionStatus} from "../../interfaces/enums/transaction-status";
import {TransactionTypes} from "../../interfaces/enums/transaction-types";

type Tx = (SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction);
type TxList = Tx[]

class AddTx extends SimpleAction<TxList> {
  constructor() {
    super(AppStateReduceId.AddTransaction, 'transactions');
  }

  reducer(state: State, payload: TxList): State {
    const tx = (_tx) => ({
      status: TransactionStatus.pending,
      type: TransactionTypes.unknown,
      date: +new Date(),
      amount: "0",
      currency: 'TOKEN',
      ..._tx,
      id: uuidv4(),
    });

    const transformed = [...state.transactions, ...payload.map(tx)]
    return super.reducer(state, transformed);
  }
}

class RemoveTx extends SimpleAction<TxList> {
  constructor() {
    super(AppStateReduceId.RemoveTransaction, 'transactions');
  }

  reducer(state: State, payload: TxList): State {
    const transformed = state.transactions.filter(({id}) => !payload.some(({id: _id}) => _id === id));
    return super.reducer(state, transformed);
  }
}

class UpdateTx extends SimpleAction<TxList> {
  constructor() {
    super(AppStateReduceId.RemoveTransaction, 'transactions');
  }

  reducer(state: State, payload: TxList): State {
    const transformed = [...state.transactions];

    payload.forEach((tx) => {
      const i = transformed.findIndex(t => t.id === tx.id);
      if (i > -1)
        transformed.splice(i, 1, tx);
    });

    return super.reducer(state, transformed);
  }
}

export const changeTxList = new SimpleAction(AppStateReduceId.Transactions, 'transactions');
export const removeTx = new RemoveTx();
export const addTx = new AddTx();
export const updateTx = new UpdateTx();
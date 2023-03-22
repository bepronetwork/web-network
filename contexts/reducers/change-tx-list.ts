import {v4 as uuidv4} from "uuid";

import {SimpleAction} from "contexts/reducers/reducer";

import { saveTransactionsToStorage } from "helpers/transactions";

import {State} from "interfaces/application-state";
import {AppStateReduceId} from "interfaces/enums/app-state-reduce-id";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import {BlockTransaction, SimpleBlockTransactionPayload, UpdateBlockTransaction} from "interfaces/transaction";

type Tx = Partial<(SimpleBlockTransactionPayload | BlockTransaction | UpdateBlockTransaction)>;
export type TxList = Tx[];

enum SubActions {add, remove, update, change}

class ChangeTxList extends SimpleAction<TxList, SubActions> {
  constructor() {
    super(AppStateReduceId.AddTransaction, 'transactions');
  }

  reducer(state: State, payload: TxList, subAction): State {   
    let transformed;

    const addMapper = (_tx) => ({
      status: TransactionStatus.pending,
      type: TransactionTypes.unknown,
      amount: "0",
      currency: 'TOKEN',
      ..._tx,
    });

    switch (subAction) {

    case SubActions.add:
      transformed = [...state.transactions, ...payload.map(addMapper)];

      break;

    case SubActions.remove:
      transformed = state.transactions.filter(({id}) => !payload.some(({id: _id}) => _id === id));
      break;

    case SubActions.update:
      transformed = [...state.transactions];

      payload.forEach((tx) => {
        const i = transformed.findIndex(t => t.id === tx.id);
        if (i > -1)
          transformed.splice(i, 1, tx);
      });
      break;

    case SubActions.change:
      transformed = payload;
      break;

    default:
      console.debug(`Unknown subAction ${subAction}`);
      break;
    }

    saveTransactionsToStorage(transformed);

    return super.reducer(state, transformed);
  }
}

export const changeTxList = new ChangeTxList();

export const addTx = 
  (tx: TxList) => changeTxList.update(tx.map(t => ({...t, id: uuidv4(), date: +new Date() })), SubActions.add);
export const removeTx = (tx: TxList) => changeTxList.update(tx, SubActions.remove);
export const updateTx = (tx: TxList) => changeTxList.update(tx, SubActions.update);
export const setTxList = (tx: TxList) => changeTxList.update(tx, SubActions.change);
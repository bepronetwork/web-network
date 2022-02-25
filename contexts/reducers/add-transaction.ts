import {ApplicationState} from '@interfaces/application-state';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {SimpleBlockTransactionPayload,} from '@interfaces/transaction';
import {v4 as uuidv4} from 'uuid';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import { INetwork } from '@interfaces/network';


const reducer = (state: ApplicationState, payload: SimpleBlockTransactionPayload): ApplicationState =>
  ({...state, myTransactions: [payload, ...state.myTransactions]})

export const AddTransactions: ReduceAction<SimpleBlockTransactionPayload> = {
  name: ReduceActionName.AddTransactions,
  fn: reducer
}

export const addTransaction = (payload: Partial<SimpleBlockTransactionPayload>, network: INetwork): ReduceActor<SimpleBlockTransactionPayload> =>
  ({
    name: ReduceActionName.AddTransactions,
    payload: {
      status: TransactionStatus.pending,
      type: TransactionTypes.unknown,
      date: +new Date(),
      amount: 0,
      currency: '$BEPRO',
      network,
      ...payload,
      id: uuidv4(),
    }});

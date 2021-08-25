import {ApplicationState} from '../../interfaces/application-state';
import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {Transactions} from '../../interfaces/transactions';

const reducer = (state: ApplicationState, payload): ApplicationState =>
  ({...state, myTransactions: [...state.myTransactions, payload]})

export const AddTransactions: ReduceAction<string> = {
  name: ReduceActionName.AddTransactions,
  fn: reducer
}

export const addTransactions = (payload: Transactions): ReduceActor<Transactions> =>
  ({name: ReduceActionName.AddTransactions, payload});

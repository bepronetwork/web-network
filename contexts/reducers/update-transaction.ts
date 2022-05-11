import {ApplicationState} from '@interfaces/application-state';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {UpdateBlockTransaction} from '@interfaces/transaction';


const reducer = (state: ApplicationState, payload: UpdateBlockTransaction): ApplicationState => {
  const index = state.myTransactions.findIndex(({id}) => id === payload.id);

  if (index === -1)
    return ({...state,})

  state.myTransactions.splice(index, 1, ...!payload.remove ? [payload] : []);



  return ({...state, myTransactions: [...state.myTransactions]})
}

export const UpdateTransaction: ReduceAction<UpdateBlockTransaction> = {
  name: ReduceActionName.UpdateTransaction,
  fn: reducer
}

export const updateTransaction = (payload: UpdateBlockTransaction): ReduceActor<UpdateBlockTransaction> =>
  ({name: ReduceActionName.UpdateTransaction, payload,});

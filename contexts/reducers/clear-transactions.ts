import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";
import { SimpleBlockTransactionPayload } from "interfaces/transaction";

const reducer = (state: ApplicationState): ApplicationState => ({
  ...state,
  myTransactions: []
});

export const ClearTransactions: ReduceAction<SimpleBlockTransactionPayload> = {
  name: ReduceActionName.ClearTransactions,
  fn: reducer
};

export const clearTransactions = (payload?: string): ReduceActor<string> => ({ 
  name: ReduceActionName.ClearTransactions ,
  payload
});

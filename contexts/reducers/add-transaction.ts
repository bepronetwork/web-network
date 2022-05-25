import { v4 as uuidv4 } from "uuid";

import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Network } from "interfaces/network";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";
import { SimpleBlockTransactionPayload } from "interfaces/transaction";

const reducer = (state: ApplicationState,
  payload: SimpleBlockTransactionPayload): ApplicationState => ({
  ...state,
  myTransactions: [payload, ...state.myTransactions]
  });

export const AddTransactions: ReduceAction<SimpleBlockTransactionPayload> = {
  name: ReduceActionName.AddTransactions,
  fn: reducer
};

export const addTransaction = (payload: Partial<SimpleBlockTransactionPayload>,
  network: Network): ReduceActor<SimpleBlockTransactionPayload> => ({
  name: ReduceActionName.AddTransactions,
  payload: {
    status: TransactionStatus.pending,
    type: TransactionTypes.unknown,
    date: +new Date(),
    amount: 0,
    currency: "$TOKEN",
    network,
    ...payload,
    id: uuidv4()
  }
  });

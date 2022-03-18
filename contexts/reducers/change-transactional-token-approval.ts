import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  isTransactionalTokenApproved: payload
});

export const ChangeTransactionalTokenApproval: ReduceAction<boolean> = {
  name: ReduceActionName.ChangeTransactionalTokenApproval,
  fn: reducer
};

export const changeTransactionalTokenApproval = (
  payload: boolean
): ReduceActor<boolean> => ({
  name: ReduceActionName.ChangeTransactionalTokenApproval,
  payload
});

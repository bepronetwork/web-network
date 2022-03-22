import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  isSettlerTokenApproved: payload
});

export const ChangeSettlerTokenApproval: ReduceAction<boolean> = {
  name: ReduceActionName.ChangeSettlerTokenApproval,
  fn: reducer
};

export const changeSettlerTokenApproval = (payload: boolean): ReduceActor<boolean> => ({
  name: ReduceActionName.ChangeSettlerTokenApproval,
  payload
});

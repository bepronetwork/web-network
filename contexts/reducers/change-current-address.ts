import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  currentAddress: payload
});

export const ChangeCurrentAddress: ReduceAction<boolean> = {
  name: ReduceActionName.ChangeAddress,
  fn: reducer
};

export const changeCurrentAddress = (payload: string): ReduceActor<string> => ({
  name: ReduceActionName.ChangeAddress,
  payload
});

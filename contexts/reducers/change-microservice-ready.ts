import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (
  state: ApplicationState,
  payload: boolean
): ApplicationState => ({ ...state, microServiceReady: payload });

export const ChangeMicroServiceReady: ReduceAction<boolean> = {
  name: ReduceActionName.ChangeMicroServiceReadyState,
  fn: reducer
};

export const changeMicroServiceReady = (
  payload: boolean
): ReduceActor<boolean> => ({
  name: ReduceActionName.ChangeMicroServiceReadyState,
  payload
});

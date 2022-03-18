import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (
  state: ApplicationState,
  payload: string
): ApplicationState => ({ ...state, network: payload });

export const ChangeNetwork: ReduceAction<string> = {
  name: ReduceActionName.ChangeNetwork,
  fn: reducer
};

export const changeNetwork = (payload: string): ReduceActor<string> => ({
  name: ReduceActionName.ChangeNetwork,
  payload
});

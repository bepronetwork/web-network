import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState,
  payload: number): ApplicationState => ({ ...state, networkId: payload });

export const ChangeNetworkId: ReduceAction<number> = {
  name: ReduceActionName.ChangeNetworkId,
  fn: reducer
};

export const changeNetworkId = (payload: number): ReduceActor<number> => ({
  name: ReduceActionName.ChangeNetworkId,
  payload
});

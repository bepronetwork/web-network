import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  showWeb3Dialog: payload
});

export const ChangeShowWeb3Dialog: ReduceAction<boolean> = {
  name: ReduceActionName.ShowWeb3Dialog,
  fn: reducer
};

export const changeShowWeb3DialogState = (payload: boolean): ReduceActor<boolean> => ({ 
  name: ReduceActionName.ShowWeb3Dialog, 
  payload 
});
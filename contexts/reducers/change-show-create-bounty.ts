import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  showCreateBounty: payload
});

export const ChangeShowCreateBounty: ReduceAction<boolean> = {
  name: ReduceActionName.ShowCreateBounty,
  fn: reducer
};

export const changeShowCreateBountyState = (payload: boolean): ReduceActor<boolean> => ({ 
  name: ReduceActionName.ShowCreateBounty, 
  payload 
});
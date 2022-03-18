import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const ReduceActions: ReduceAction[] = [];

const findReducer = (action: ReduceActionName) =>
  ReduceActions.find(({ name }) => name === action);

export const mainReducer = <T = any>(
  state: ApplicationState,
  action: ReduceActor<T>
) => {
  const act = ReduceActions.find(({ name }) => name === action.name)?.fn;
  if (act) return act(state, action.payload);

  throw new Error(`Could not find reducer with name ${action.name}`);
};

export const addReducer = (reducer: ReduceAction<any>) =>
  (!findReducer(reducer.name) && ReduceActions.push(reducer)) || false;

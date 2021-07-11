import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {ApplicationState} from '../../interfaces/application-state';

const ReduceActions: ReduceAction[] = [];

const findReducer = (action: ReduceActionName) => ReduceActions.find(({name}) => name === action);

export const mainReducer = (state: ApplicationState, action: ReduceActor) => {
  const act = ReduceActions.find(({name}) => name === action.name)?.fn;
  return act ? act(state, action.payload) : {...state};
}

export const addReducer = (reducer: ReduceAction<any>) => !findReducer(reducer.name) && ReduceActions.push(reducer) || false;

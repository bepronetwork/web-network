import {State} from "interfaces/application-state";

import {XReducer,} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";


export const Actions: XReducer<any>[] = [];

const findReducer = (id: number) =>
  Actions.find(({ id: _id }) => _id === id);

export const addReducer = (reducer: XReducer<any>) => {
  const action = findReducer(reducer.id);
  console.debug(`${!action ? 'Added' : 'Skipped'} ${reducer.id}, ${reducer.stateKey}, ${AppStateReduceId[reducer.id]}`);
  return (!action && Actions.push(reducer)) || false;
}


export const mainReducer = <T = any> (state: State, actor: { id, payload, subAction }) => {
  console.debug('REDUCE', actor.id, state);

  const action = Actions.find(({id: id}) => id === actor.id);
  if (!action)
    throw new Error(`No action found for ${actor.id}`);

  return action.reducer(state, actor.payload, actor.subAction);
}
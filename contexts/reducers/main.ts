import {State} from "interfaces/application-state";

import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {XReducer,} from "./reducer";


export const Actions: XReducer[] = [];

const findReducer = (id: number) =>
  Actions.find(({ id: _id }) => _id === id);

export const addReducer = <T = any>(reducer: XReducer<T>) => {
  const action = findReducer(reducer.id);
  //console.debug(`${!action ? 'Added' : 'Skipped'} ${reducer.id}, ${reducer.stateKey}, ${AppStateReduceId[reducer.id]}`);
  return (!action && Actions.push(reducer)) || false;
}


export const mainReducer = (state: State, actor: { id, payload, subAction }) => {
  // console.debug(`REDUCE ${actor.id}`, state);

  const action = Actions.find(({id: id}) => id === actor.id);
  if (!action)
    throw new Error(`No action found for ${AppStateReduceId[actor.id]}`);

  return action.reducer(state, actor.payload, actor.subAction);
}
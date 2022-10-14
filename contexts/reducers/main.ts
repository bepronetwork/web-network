import {State} from "interfaces/application-state";
import {XReducer,} from "./reducer";


export const Actions: XReducer<any>[] = [];

const findReducer = (id: number) =>
  Actions.find(({ id: _id }) => _id === id);

export const addReducer = (reducer: XReducer<any>) =>
  (!findReducer(reducer.id) && Actions.push(reducer)) || false;

export const mainReducer = <T = any> (state: State, actor: { id, payload, subAction }) => {
  console.debug(`reducingState`, actor, Actions);

  const action = Actions.find(({id: id}) => id === actor.id);
  if (!action)
    throw new Error(`No action found for ${actor.id}`);

  return action.reducer(state, actor.payload, actor.subAction);
}
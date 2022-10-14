import {State} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";

export abstract class Actor<T = any> {
  readonly id: AppStateReduceId;
  abstract update(payload: T): {id: AppStateReduceId, payload: T};
}

export abstract class Action<T = any> {
  readonly id: AppStateReduceId;
  readonly stateKey?: string;

  abstract reducer(state: State, payload: T): State;
}

export class SimpleActor<T = any> implements Actor<T> {
  constructor(readonly id) {}

  update(payload: T): { id: AppStateReduceId; payload: T } {
    return {id: this.id, payload};
  }
}

export class SimpleAction<T = any> extends SimpleActor<T> implements Action<T> {
  constructor(readonly id: AppStateReduceId, readonly stateKey: keyof State) {
    super(id)
  }

  reducer(state: State, payload: T): State {
    console.debug(`updating`, this.stateKey, payload);
    return {...state, [this.stateKey]: payload};
  }
}

export type XReducerAction<T> = { id: AppStateReduceId, payload: T };
export type XReducer<T> = Actor<T> & Action<T>;
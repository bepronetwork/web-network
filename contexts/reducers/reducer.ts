import {State} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";

export abstract class Actor<P = any, A = any> {
  readonly id: AppStateReduceId;
  abstract update(payload: P, subAction?: A): {id: AppStateReduceId, payload: P, subAction?: A};
}

export abstract class Action<P = any, A = any> {
  readonly id: AppStateReduceId;
  readonly stateKey?: string;

  abstract reducer(state: State, payload: P, subAction?: A): State;
}

export class SimpleActor<P = any, A = any> implements Actor<P, A> {
  constructor(readonly id) {}

  update(payload: P, subAction?: A) {
    return {id: this.id, payload, subAction};
  }
}

export class SimpleAction<T = any, A = any> extends SimpleActor<T> implements Action<T> {
  constructor(readonly id: AppStateReduceId, readonly stateKey: keyof State) {
    console.debug(`creating`, id, stateKey);
    super(id)
  }

  reducer(state: State, payload: T, subAction?: A): State {
    console.debug(`UPDATING ${this.id} ${this.stateKey} ${subAction || `subAction=undefined`}`, payload, state);
    return {...state, [this.stateKey]: payload};
  }
}

export type XReducerAction<T> = { id: AppStateReduceId, payload: T };
export type XReducer<T = any> = Actor<T> & Action<T>;
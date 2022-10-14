import {ServiceState, State} from "../../interfaces/application-state";
import {Action, SimpleActor} from "./reducer";

export class ChangeServiceProp extends SimpleActor<boolean> implements Action<boolean> {

  constructor(readonly id,
              readonly prop: keyof ServiceState) {
    super(id);
  }

  reducer(state: State, payload: boolean): State {
    const transformed = {
      ...state.Service || {} as any,
      [this.prop]: payload,
    }

    return {...state, Service: transformed};
  }
}
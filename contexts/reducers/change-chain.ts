import {ConnectedChain, State} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SimpleAction} from "./reducer";

export class ChangeConnectedChain extends SimpleAction<ConnectedChain | Partial<ConnectedChain>> {
  constructor() {
    super(AppStateReduceId.ConnectedChainMatch, "connectedChain");
  }

  reducer(state: State, payload: ConnectedChain | Partial<ConnectedChain>): State {
    const transformed = {
      ...state.connectedChain,
      ...payload
    };

    return super.reducer(state, transformed);
  }
}


export const changeChain = new ChangeConnectedChain();
export const changeMatchWithNetworkChain = 
  (matchWithNetworkChain: boolean) => changeChain.update({ matchWithNetworkChain });
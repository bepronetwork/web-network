import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {ConnectedChain} from "../../interfaces/application-state";

export const changeChain =
  new SimpleAction<ConnectedChain>(AppStateReduceId.ConnectedChain, "connectedChain");
import {ConnectedChain} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SimpleAction} from "./reducer";

export const changeChain =
  new SimpleAction<ConnectedChain>(AppStateReduceId.ConnectedChain, "connectedChain");
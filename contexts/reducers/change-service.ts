import { Web3Connection } from "@taikai/dappkit";

import { SupportedChainData } from "interfaces/supported-chain-data";

import {
  NetworkAmounts,
  NetworkTimes,
  ServiceNetwork,
  ServiceState,
  State
} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {Network} from "../../interfaces/network";
import {Token} from "../../interfaces/token";
import DAO from "../../services/dao-service";
import {SimpleAction} from "./reducer";

export class ChangeServiceProp<T = ServiceState | Partial<ServiceState>, A = keyof ServiceState>
  extends SimpleAction<T, A> {

  constructor(id  = AppStateReduceId.Service) {
    super(id, 'Service');
  }

  reducer(state: State, payload, subAction): State {
    return super.reducer(state, Object.assign(state.Service || {}, {[subAction]: payload}) as any); // eslint-disable-line
  }
}

export class ChangeServiceNetworkProp<T = ServiceNetwork|Partial<ServiceNetwork>, A = keyof ServiceNetwork>
  extends ChangeServiceProp<T, A> {

  constructor(id = AppStateReduceId.Network) {
    super(id);
  }

  reducer(state: State, payload, subAction = 'network'): State {
    return super.reducer(state, Object.assign(state.Service?.network || {}, payload), subAction); // eslint-disable-line
  }
}

export const changeServiceProp = new ChangeServiceProp();
export const changeNetwork = new ChangeServiceNetworkProp();

export const changeStarting = (starting: boolean) => changeServiceProp.update(starting as any, 'starting');

export const changeActiveDAO = (active: DAO) => changeServiceProp.update(active, 'active');

export const changeNetworkLastVisited = (lastVisited: string) => changeNetwork.update({lastVisited});

export const changeActiveNetwork = (active: Network) => changeNetwork.update({active});
export const changeActiveNetworkTimes = (times: NetworkTimes) => changeNetwork.update({times});
export const changeActiveNetworkAmounts = (amounts: NetworkAmounts) => changeNetwork.update({amounts});
export const changeActiveAvailableChains = 
  (availableChains: SupportedChainData[]) => changeNetwork.update({availableChains});

export const changeWeb3Connection = (web3Connection: Web3Connection) => 
  changeServiceProp.update(web3Connection, "web3Connection");
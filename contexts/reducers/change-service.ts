import {
  NetworkAmounts,
  NetworkTimes,
  ServiceNetwork,
  ServiceNetworkRepos,
  ServiceNetworkReposActive,
  ServiceState,
  State
} from "../../interfaces/application-state";
import {BranchesList} from "../../interfaces/branches-list";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {Network} from "../../interfaces/network";
import {ForksList, ReposList} from "../../interfaces/repos-list";
import {Token} from "../../interfaces/token";
import DAO from "../../services/dao-service";
import {SimpleAction} from "./reducer";

export class ChangeServiceProp<T = ServiceState | Partial<ServiceState>, A = keyof ServiceState>
  extends SimpleAction<T, A> {

  constructor(id  = AppStateReduceId.Service) {
    super(id, 'Service');
  }

  reducer(state: State, payload, subAction): State {
    return super.reducer(state, Object.assign(state.Service || {}, {[subAction]: payload}) as T);
  }
}

export class ChangeServiceNetworkProp<T = ServiceNetwork|Partial<ServiceNetwork>, A = keyof ServiceNetwork>
  extends ChangeServiceProp<T, A> {

  constructor(id = AppStateReduceId.Network) {
    super(id);
  }

  reducer(state: State, payload, subAction = 'network'): State {
    return super.reducer(state, Object.assign(state.Service?.network || {}, payload), subAction);
  }
}

export class ChangeServiceNetworkReposProp
  extends ChangeServiceNetworkProp<ServiceNetworkRepos | Partial<ServiceNetworkRepos>, keyof ServiceNetworkRepos> {
  constructor() {
    super(AppStateReduceId.NetworkRepos);
  }

  reducer(state: State, payload): State {
    return super.reducer(state, Object.assign(state.Service.network || {}, {repos: {...state.Service?.network?.repos || {}, ...payload}})); // eslint-disable-line
  }
}


export const changeServiceProp = new ChangeServiceProp();
export const changeNetwork = new ChangeServiceNetworkProp();
export const changeRepos = new ChangeServiceNetworkReposProp();

export const changeStarting = (starting: boolean) => changeServiceProp.update({starting}, 'starting');

export const changeMicroServiceReady = (microReady: boolean) =>
  changeServiceProp.update({microReady}, 'microReady');

export const changeActiveDAO = (active: DAO) => changeServiceProp.update(active, 'active');

export const changeNetworkLastVisited = (lastVisited: string) => changeNetwork.update({lastVisited});
export const changeNoDefaultNetwork = (noDefaultNetwork: boolean) => changeNetwork.update({noDefaultNetwork});

export const changeActiveNetwork = (active: Network) => changeNetwork.update({active});
export const changeActiveNetworkToken = (networkToken: Token) => changeNetwork.update({networkToken});
export const changeActiveNetworkTimes = (times: NetworkTimes) => changeNetwork.update({times});
export const changeActiveNetworkAmounts = (amounts: NetworkAmounts) => changeNetwork.update({amounts});

export const changeAllowedTokens = (transactional: Token[], reward: Token[]) =>
  changeNetwork.update({tokens: {transactional, reward}})

export const changeNetworkReposList = (list: ReposList) => changeRepos.update({list});

export const changeNetworkReposForks = (forks: ForksList) => changeRepos.update({forks});

export const changeNetworkReposBranches = (branches: BranchesList) => changeRepos.update({branches});

export const changeNetworkReposActive = (active: ServiceNetworkReposActive) => changeRepos.update({active});
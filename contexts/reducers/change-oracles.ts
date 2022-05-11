import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ApplicationState} from '@interfaces/application-state';
import {OraclesState} from '@interfaces/oracles-state';

const reducer = (state: ApplicationState, payload: OraclesState): ApplicationState =>
  ({...state, oracles: payload})

export const ChangeOraclesState: ReduceAction<OraclesState> = {
  name: ReduceActionName.Oracles,
  fn: reducer
}

export const changeOraclesParse = (currentAddress: string, oracles: OraclesState) => {

  const reduceAddresses = (p, c, i) =>
  (`${c}`.toLocaleLowerCase() === currentAddress.toLocaleLowerCase() || !+oracles.amounts[i] ? {...p} : {...p, [c]: +oracles.amounts[i]});

  const delegatedEntries: [string, number][] = Object.entries(oracles.addresses.reduce(reduceAddresses, {}))
  const delegatedToOthers = delegatedEntries.reduce((p, [address, value]) => p += +value, 0);

  return ({...oracles, delegatedToOthers, delegatedEntries})
}

export const changeOraclesState = (payload: OraclesState): ReduceActor<OraclesState> => ({name: ReduceActionName.Oracles, payload});

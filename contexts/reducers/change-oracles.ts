import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ApplicationState} from '../../interfaces/application-state';
import {OraclesState} from '../../interfaces/oracles-state';

const reducer = (state: ApplicationState, payload: OraclesState): ApplicationState =>
  ({...state, oracles: payload})

export const ChangeOraclesState: ReduceAction<OraclesState> = {
  name: ReduceActionName.Oracles,
  fn: reducer
}

export const changeOraclesState = (payload: OraclesState): ReduceActor<OraclesState> => ({name: ReduceActionName.Oracles, payload});

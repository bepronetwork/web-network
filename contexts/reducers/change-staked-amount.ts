import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ApplicationState} from '../../interfaces/application-state';

const reducer = (state: ApplicationState, payload: number): ApplicationState =>
  ({...state, beproStaked: payload})

export const ChangeStakedState: ReduceAction<number> = {
  name: ReduceActionName.Staked,
  fn: reducer
}

export const changeStakedState = (payload: number): ReduceActor<number> => ({name: ReduceActionName.Staked, payload});

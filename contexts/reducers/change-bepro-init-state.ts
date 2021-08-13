import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ApplicationState} from '@interfaces/application-state';

const reducer = (state: ApplicationState, payload): ApplicationState =>
  ({...state, beproInit: payload})

export const ChangeBeproInit: ReduceAction<boolean> = {
  name: ReduceActionName.BeproInit,
  fn: reducer
}

export const changeBeproInitState = (payload: boolean): ReduceActor<boolean> => ({name: ReduceActionName.BeproInit, payload});

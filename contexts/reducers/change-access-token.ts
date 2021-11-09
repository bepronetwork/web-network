import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ApplicationState} from '@interfaces/application-state';

const reducer = (state: ApplicationState, payload: string): ApplicationState =>
  ({...state, accessToken: payload})

export const ChangeAccessToken: ReduceAction<string> = {
  name: ReduceActionName.ChangeAccessToken,
  fn: reducer
}

export const changeAccessToken = (payload: string): ReduceActor<string> => ({name: ReduceActionName.ChangeAccessToken, payload});

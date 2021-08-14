import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ApplicationState} from '@interfaces/application-state';

const reducer = (state: ApplicationState, payload): ApplicationState =>
  ({...state, githubHandle: payload})

export const ChangeGithubHandle: ReduceAction<string> = {
  name: ReduceActionName.GithubHandle,
  fn: reducer
}

export const changeGithubHandle = (payload: string): ReduceActor<string> => ({name: ReduceActionName.GithubHandle, payload});

import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => ({
  ...state,
  githubLogin: payload
});

export const ChangeGithubLogin: ReduceAction<string> = {
  name: ReduceActionName.GithubLogin,
  fn: reducer
};

export const changeGithubLogin = (payload: string): ReduceActor<string> => ({
  name: ReduceActionName.GithubLogin,
  payload
});

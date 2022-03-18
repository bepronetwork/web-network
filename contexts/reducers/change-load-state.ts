import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { LoadingState } from "interfaces/loading-state";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

let loaderWeight = 0;

const reducer = (
  state: ApplicationState,
  { isLoading, text }: LoadingState
): ApplicationState => ({
  ...state,
  loading: { ...state.loading, isLoading, text }
});

export const ChangeLoadState: ReduceAction<LoadingState> = {
  name: ReduceActionName.Loading,
  fn: reducer
};

export const changeLoadState = (
  isLoading: boolean,
  text?: string
): ReduceActor<LoadingState> => {
  loaderWeight += isLoading ? 1 : -1;
  if (loaderWeight < 0) loaderWeight = 0;

  return {
    name: ReduceActionName.Loading,
    payload: { isLoading: !!loaderWeight, text }
  };
};

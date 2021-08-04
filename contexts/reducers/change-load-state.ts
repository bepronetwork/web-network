import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ApplicationState} from '../../interfaces/application-state';
import {LoadingState} from '../../interfaces/loading-state';

const reducer = (state: ApplicationState, {isLoading, text}: LoadingState): ApplicationState =>
  ({...state, loading: { ...state.loading, isLoading, text}})

export const ChangeLoadState: ReduceAction<LoadingState> = {
  name: ReduceActionName.Loading,
  fn: reducer
}

export const changeLoadState = (isLoading: boolean, text?: string): ReduceActor<LoadingState> =>
  ({name: ReduceActionName.Loading, payload: {isLoading, text}});

import {ApplicationState} from '../../interfaces/application-state';
import {ReduceAction, ReduceActor} from '../../interfaces/reduce-action';
import {ReduceActionName} from '../../interfaces/enums/reduce-action-names';
import {ToastNotification} from '../../interfaces/toast-notification';

const reducer = (state: ApplicationState, payload): ApplicationState => {
  const toaster = Array.from(state.toaster);
  toaster.splice(payload, 1);
  return ({...state, toaster})
}

export const RemoveToast: ReduceAction<string> = {
  name: ReduceActionName.RemoveToast,
  fn: reducer
}

export const removeToast = (payload: number): ReduceActor<number> =>
  ({name: ReduceActionName.RemoveToast, payload});

import {ApplicationState} from '@interfaces/application-state';
import {ReduceAction, ReduceActor} from '@interfaces/reduce-action';
import {ReduceActionName} from '@interfaces/enums/reduce-action-names';
import {ToastNotification} from '@interfaces/toast-notification';

const reducer = (state: ApplicationState, payload): ApplicationState =>
  ({...state, toaster: [...state.toaster, payload]})

export const AddToast: ReduceAction<string> = {
  name: ReduceActionName.AddToast,
  fn: reducer
}

export const addToast = (payload: ToastNotification): ReduceActor<ToastNotification> =>
  ({name: ReduceActionName.AddToast, payload: {type: 'light', delay: 3000, ...payload}});

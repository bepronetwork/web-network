import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {ToastNotification} from "../../interfaces/toast-notification";
import {State} from "../../interfaces/application-state";
import {v4 as uuidv4} from "uuid";

class AddToast extends SimpleAction<ToastNotification[]> {
  constructor() {
    super(AppStateReduceId.AddToast, 'toaster');
  }

  reducer(state: State, payload: ToastNotification[]): State {
    const mapper = (toast) => ({
      type: "primary",
      delay: 10000,
      ...toast,
      id: uuidv4()
    });

    return super.reducer(state, [...state.toaster, ...payload.map(mapper)]);
  }
}

class RemoveToast extends SimpleAction<ToastNotification[]> {
  constructor() {
    super(AppStateReduceId.RemoveToast, 'toaster');
  }

  reducer(state: State, payload: ToastNotification[]): State {
    const transformed = state.toaster.filter(({id}) => !payload.some(({id: _id}) => _id === id));
    return super.reducer(state, transformed);
  }
}

export const addToast = new AddToast();
export const removeToast = new RemoveToast();

export const toastError = (content: string, title = "Error", ...rest) =>
  addToast.update([{content, title, type: `danger`, ...rest}])
export const toastSuccess = (content: string, title = "success", ...rest) =>
  addToast.update([{content, title, type: `success`, ...rest}])
export const toastInfo = (content: string, title = "Info", ...rest) =>
  addToast.update([{content, title, type: `info`, ...rest}])
export const toastWarning = (content: string, title = "Warning", ...rest) =>
  addToast.update([{content, title, type: `warning`, ...rest}])
export const toastPrimary = (content: string, title = "BEPRO", ...rest) =>
  addToast.update([{content, title, type: `primary`, ...rest}])
export const toastSecondary = (content: string, title = "Notice", ...rest) =>
  addToast.update([{content, title, type: `secondary`, ...rest}])
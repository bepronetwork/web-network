import {SimpleAction} from "./reducer";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {ToastNotification} from "../../interfaces/toast-notification";
import {State} from "../../interfaces/application-state";
import {v4 as uuidv4} from "uuid";

enum SubActions { add, remove}

class AddToast extends SimpleAction<ToastNotification[], SubActions> {
  constructor() {
    super(AppStateReduceId.AddToast, 'toaster');
  }

  reducer(state: State, payload: ToastNotification[], subAction): State {
    let transformed;
    switch (subAction) {
      case SubActions.add:
        const mapper = (toast) => ({
          type: "primary",
          delay: 10000,
          ...toast,
          id: uuidv4()
        });

        transformed = [...state.toaster, ...payload.map(mapper)];
        break;
      case SubActions.remove:
        transformed = state.toaster.filter(({id}) => !payload.some(({id: _id}) => _id === id));
        break;
      default:
        console.log(`Something went wrong, ${subAction} is not a valid subAction`);
        break;
    }


    return super.reducer(state, transformed);
  }
}

export const changeToaster = new AddToast();

export const removeToast = (toast: ToastNotification) =>
  changeToaster.update([toast], SubActions.remove);
export const toastError = (content: string, title = "Error", ...rest) =>
  changeToaster.update([{content, title, type: `danger`, ...rest}], SubActions.add)
export const toastSuccess = (content: string, title = "success", ...rest) =>
  changeToaster.update([{content, title, type: `success`, ...rest}], SubActions.add)
export const toastInfo = (content: string, title = "Info", ...rest) =>
  changeToaster.update([{content, title, type: `info`, ...rest}], SubActions.add)
export const toastWarning = (content: string, title = "Warning", ...rest) =>
  changeToaster.update([{content, title, type: `warning`, ...rest}], SubActions.add)
export const toastPrimary = (content: string, title = "BEPRO", ...rest) =>
  changeToaster.update([{content, title, type: `primary`, ...rest}], SubActions.add)
export const toastSecondary = (content: string, title = "Notice", ...rest) =>
  changeToaster.update([{content, title, type: `secondary`, ...rest}], SubActions.add)
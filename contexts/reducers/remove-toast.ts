import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState, payload): ApplicationState => {
  const toaster = Array.from(state.toaster);
  const i = toaster.findIndex(({ id }) => id === payload);

  if (i > -1) toaster.splice(i, 1);

  return { ...state, toaster };
};

export const RemoveToast: ReduceAction<string> = {
  name: ReduceActionName.RemoveToast,
  fn: reducer
};

export const removeToast = (payload: string): ReduceActor<string> => ({
  name: ReduceActionName.RemoveToast,
  payload
});

import { ApplicationState } from "interfaces/application-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (state: ApplicationState,
  payload: number[]): ApplicationState => ({ ...state, myIssues: payload });

export const ChangeMyIssuesState: ReduceAction<number[]> = {
  name: ReduceActionName.MyIssues,
  fn: reducer
};

export const changeMyIssuesState = (payload: number[]): ReduceActor<number[]> => 
({ name: ReduceActionName.MyIssues, payload });

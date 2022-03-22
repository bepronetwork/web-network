import { ApplicationState } from "./application-state";
import { ReduceActionName } from "./enums/reduce-action-names";

export interface ReduceAction<Payload = Partial<ApplicationState>> {
  name: ReduceActionName;
  fn: (currentState: ApplicationState, payload: Payload) => ApplicationState;
}

export type ReduceActor<Payload = Partial<ApplicationState>> = Pick<
  ReduceAction,
  "name"
> & { payload: Payload };

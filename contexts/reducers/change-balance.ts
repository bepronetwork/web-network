import { ApplicationState } from "interfaces/application-state";
import { BalanceState } from "interfaces/balance-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

const reducer = (
  state: ApplicationState,
  payload: Partial<BalanceState> | BalanceState
): ApplicationState => ({
  ...state,
  balance: { ...state.balance, ...payload }
});

export const ChangeBalance: ReduceAction<Partial<BalanceState> | BalanceState> =
  {
    name: ReduceActionName.ChangeBalance,
    fn: reducer
  };

export const changeBalance = (
  payload: Partial<BalanceState> | BalanceState
): ReduceActor<Partial<BalanceState> | BalanceState> => ({
  name: ReduceActionName.ChangeBalance,
  payload
});

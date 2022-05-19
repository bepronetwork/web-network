import { ApplicationState } from "interfaces/application-state";
import { BalanceState } from "interfaces/balance-state";
import { ReduceActionName } from "interfaces/enums/reduce-action-names";
import { ReduceAction, ReduceActor } from "interfaces/reduce-action";

type PartialBalance = Partial<BalanceState> | BalanceState

const reducer = (state: ApplicationState,
  payload: PartialBalance): ApplicationState => ({
  ...state,
  balance: { ...state.balance, ...payload },
  });

export const ChangeBalance: ReduceAction<PartialBalance> =
  {
    name: ReduceActionName.ChangeBalance,
    fn: reducer,
  };

export const changeBalance = (payload: PartialBalance): ReduceActor<PartialBalance> => ({
  name: ReduceActionName.ChangeBalance,
  payload,
});

import {State} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SimpleAction} from "./reducer";

interface Spinners {
  proposals: boolean;
  pullRequests: boolean;
  bountyState: boolean;
  balance: boolean;
  wallet: boolean;
  bountyChain: boolean;
  bountyDatabase: boolean;
}

class ChangeSpinners extends SimpleAction<Spinners|Partial<Spinners>> {
  constructor() {
    super(AppStateReduceId.Spinners, 'spinners');
  }

  reducer(state: State, payload): State {
    const transformed = {
      ...state.spinners,
      ...payload,
    }

    return super.reducer(state, transformed);
  }
}

export const changeSpinners = new ChangeSpinners();

export const changeSpinnerProposal = (proposals: boolean) =>
  changeSpinners.update({proposals});

export const changeSpinnerPullRequests = (pullRequests: boolean) =>
  changeSpinners.update({pullRequests});

export const changeSpinnerBountyState = (bountyState: boolean) =>
  changeSpinners.update({bountyState});

export const changeWalletSpinnerTo = (wallet: boolean) =>
  changeSpinners.update({wallet});
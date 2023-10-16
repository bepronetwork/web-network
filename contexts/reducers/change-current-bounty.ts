import {SimpleAction} from "contexts/reducers/reducer";

import {CurrentBounty, State} from "interfaces/application-state";
import {AppStateReduceId} from "interfaces/enums/app-state-reduce-id";
import {IssueBigNumberData} from "interfaces/issue-data";

import {Tier} from 'types/settings'
export class ChangeCurrentBounty<T = CurrentBounty|Partial<CurrentBounty>, A = keyof CurrentBounty & 'clear'>
  extends SimpleAction<T, A> {

  constructor(id = AppStateReduceId.CurrentBounty) {
    super(id, 'currentBounty');
  }

  reducer(state: State, payload, subAction): State {
    let transformed;
    switch (subAction) {
    case 'comments':
    case 'data':
    case 'kycSteps':
    case 'lastUpdated':
    case 'chainData':
      transformed = {...state.currentBounty, lastUpdated: +new Date(), ...payload}
      break;

    case 'clear':
      transformed = null;
      break;
    }

    return super.reducer(state, transformed);
  }
}

export const changeCurrentBounty = new ChangeCurrentBounty();

export const changeCurrentBountyData = (data: IssueBigNumberData) =>
  changeCurrentBounty.update({data}, 'data');

export const changeCurrentKycSteps = (kycSteps: Tier[]) =>
  changeCurrentBounty.update({kycSteps}, 'kycSteps');
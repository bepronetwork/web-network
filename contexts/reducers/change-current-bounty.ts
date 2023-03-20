import {PullRequest} from "@taikai/dappkit";

import {CurrentBounty, State} from "interfaces/application-state";
import {AppStateReduceId} from "interfaces/enums/app-state-reduce-id";
import { Token } from "interfaces/token";

import {Tier} from 'types/settings'

import {BenefactorExtended, BountyExtended, ProposalExtended} from "../../interfaces/bounty";
import {IssueBigNumberData, IssueDataComment} from "../../interfaces/issue-data";
import {SimpleAction} from "./reducer";


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

export class ChangeCurrentBountyChainData extends ChangeCurrentBounty<BountyExtended | Partial<BountyExtended>, null> {
  constructor() {
    super(AppStateReduceId.CurrentBountyChainData);
  }

  reducer(state: State, payload: BountyExtended | Partial<BountyExtended>): State {
    const transformed = {
      ...state.currentBounty,
      chainData: {
        ...state.currentBounty?.chainData,
        ...payload
      }
    };

    return super.reducer(state, transformed, 'chainData');
  }
}

export const changeCurrentBounty = new ChangeCurrentBounty();

export const changeCurrentBountyComments = (comments: IssueDataComment[]) =>
  changeCurrentBounty.update({comments}, 'comments');

export const changeCurrentBountyData = (data: IssueBigNumberData) =>
  changeCurrentBounty.update({data}, 'data');

export const clearCurrentBountyData = () =>
  changeCurrentBounty.update(null, 'clear');

export const changeCurrentBountyDataChain = new ChangeCurrentBountyChainData();

export const changeCurrentBountyDataIsDraft = (isDraft: boolean) =>
  changeCurrentBountyDataChain.update({isDraft});

export const changeCurrentBountyDataIsFinished = (isFinished: boolean) =>
  changeCurrentBountyDataChain.update({isFinished});

export const changeCurrentBountyDataIsInValidation = (isInValidation: boolean) =>
  changeCurrentBountyDataChain.update({isInValidation});

export const changeCurrentBountyDataIsFundingRequest = (isFundingRequest: boolean) =>
  changeCurrentBountyDataChain.update({isFundingRequest});

export const changeCurrentBountyDataProposals = (proposals: ProposalExtended[]) =>
  changeCurrentBountyDataChain.update({proposals});

export const changeCurrentBountyDataPullRequests = (pullRequests: PullRequest[]) =>
  changeCurrentBountyDataChain.update({pullRequests});

export const changeCurrentBountyDataFunding = (funding: BenefactorExtended[]) =>
  changeCurrentBountyDataChain.update({funding});

export const changeCurrentBountyDataTransactional = (transactionalTokenData: Token) =>
  changeCurrentBountyDataChain.update({transactionalTokenData});  

export const changeCurrentBountyDataReward = (rewardTokenData: Token) =>
  changeCurrentBountyDataChain.update({rewardTokenData}); 

export const changeCurrentKycSteps = (kycSteps: Tier[]) =>
  changeCurrentBounty.update({kycSteps}, 'kycSteps');
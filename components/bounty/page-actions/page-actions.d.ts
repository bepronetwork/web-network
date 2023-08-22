import { CurrentUserState } from "interfaces/application-state";
import { IssueBigNumberData } from "interfaces/issue-data";

export interface PageActionsViewProps {
  handleEditIssue: () => void;
  handlePullrequest: (arg: {
    title: string;
    description: string;
    branch: string;
  }) => Promise<void>;
  handleStartWorking: () => Promise<void>;
  currentUser: CurrentUserState;
  bounty: IssueBigNumberData;
  isWalletConnected: boolean;
  isGithubConnected: boolean;
  isCreatePr: boolean;
  isCreateProposal: boolean;
  isExecuting: boolean;
  showPRModal: boolean;
  handleShowPRModal: (v: boolean) => void;
  ghVisibility: boolean;
  isUpdateAmountButton: boolean;
  isStartWorkingButton: boolean;
  isForkRepositoryLink: boolean;
  isEditButton: boolean;
  updateBountyData: (updatePrData?: boolean) => void;
}

export interface PageActionsControllerProps {
  isRepoForked?: boolean;
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

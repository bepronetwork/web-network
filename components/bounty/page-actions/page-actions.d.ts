import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

export interface PageActionsViewProps {
  handleEditIssue: () => void;
  onCreateDeliverableClick: () => void;
  handleStartWorking: () => Promise<void>;
  bounty: IssueBigNumberData;
  isWalletConnected: boolean;
  isCreatePr: boolean;
  isCreateProposal: boolean;
  isExecuting: boolean;
  isUpdateAmountButton: boolean;
  isStartWorkingButton: boolean;
  isEditButton: boolean;
  deliverables: Deliverable[];
  updateBountyData: (updatePrData?: boolean) => void;
}

export interface PageActionsControllerProps {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

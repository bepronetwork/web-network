import StartWorkingButton from "components/bounty/page-actions/actions/start-working.view";
import MultiActionButton from "components/common/buttons/multi-action/view";

import { Action } from "types/utils";

interface TabletAndMobileButtonProps {
  isCreatePr: boolean;
  isCreateProposal: boolean;
  isExecuting: boolean;
  isStartWorkingButton: boolean;
  handleActionWorking: () => void;
  onCreateDeliverableClick: () => void;
  handleShowPRProposal: (b: boolean) => void;
}

export default function TabletAndMobileButton({
  isCreatePr,
  isCreateProposal,
  isExecuting,
  isStartWorkingButton,
  handleActionWorking,
  onCreateDeliverableClick,
  handleShowPRProposal,
}: TabletAndMobileButtonProps) {
  const actions: Action[] = [];

  if (isCreatePr)
    actions.push({
      label: "Deliverable",
      onClick: () => onCreateDeliverableClick(),
    });

  if (isCreateProposal)
    actions.push({
      label: "Proposal",
      onClick: () => handleShowPRProposal(true),
    });

  if (isCreatePr || isCreateProposal)
    return (
      <MultiActionButton label="Create" className="col-12" actions={actions} />
    );

  if(isStartWorkingButton){
    return (
      <StartWorkingButton
        onClick={handleActionWorking}
        isExecuting={isExecuting}
      />
    )
  }else return null;
}

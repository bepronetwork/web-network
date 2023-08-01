
import React from "react";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import ItemSectionsView from "./view";

interface ItemProps {
  data: Proposal[] | PullRequest[],
  isProposal: boolean,
  currentBounty: IssueBigNumberData;
}

export default function ItemSections({ data, isProposal, currentBounty }: ItemProps) {
  const {state} = useAppState();

  const branchProtectionRules = state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired =
    branchProtectionRules ?
      branchProtectionRules[currentBounty?.branch]?.requiredApprovingReviewCount || 0 : 0;
  const canUserApprove = state.Service?.network?.repos?.active?.viewerPermission !== "READ";

  return (
    <ItemSectionsView 
      data={data} 
      isProposal={isProposal} 
      currentBounty={currentBounty} 
      approvalsRequired={approvalsRequired} 
      canUserApprove={canUserApprove}    
    />
  )
}
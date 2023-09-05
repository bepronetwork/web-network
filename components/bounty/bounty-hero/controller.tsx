import { useState } from "react";

import { useRouter } from "next/router";

import { getIssueState } from "helpers/handleTypeIssue";

import { IssueBigNumberData } from "interfaces/issue-data";

import BountyHeroView from "./view";

export default function BountyHero({
  handleEditIssue,
  isEditIssue,
  currentBounty,
  updateBountyData
}: {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}) {
  const router = useRouter();

  const [isOriginModalVisible, setIsOriginModalVisible] = useState(false);

  const { network } = router.query;
  const currentState = getIssueState({
    state: currentBounty?.state,
    amount: currentBounty?.amount,
    fundingAmount: currentBounty?.fundingAmount,
  });

  const showOriginModal = () => setIsOriginModalVisible(true);
  const hideOriginModal = () => setIsOriginModalVisible(false);

  return (
    <BountyHeroView
      bounty={currentBounty}
      updateBountyData={updateBountyData}
      network={network}
      currentState={currentState}
      handleEditIssue={handleEditIssue}
      isEditIssue={isEditIssue}
      isOriginModalVisible={isOriginModalVisible}
      showOriginModal={showOriginModal}
      hideOriginModal={hideOriginModal}
    />
  );
}

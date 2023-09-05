import { useContext } from "react";

import { useAppState } from "contexts/app-state";
import { BountyEffectsContext } from "contexts/bounty-effects";
import { changeCurrentKycSteps } from "contexts/reducers/change-current-bounty";

export function useBounty() {
  if (!useContext(BountyEffectsContext))
    throw new Error(`useBounty() depends on <BountyEffectsProvider />`);


  const { state, dispatch } = useAppState();

  function validateKycSteps(){
    const sessionSteps = state?.currentUser?.kycSession?.steps;
    const bountyTierNeeded = state?.currentBounty?.data?.kycTierList;
    const settingsTierAllowed = state?.Settings?.kyc?.tierList;

    if(!sessionSteps?.length || !bountyTierNeeded?.length) return;

    const missingSteps = settingsTierAllowed
                          ?.filter(({id}) => bountyTierNeeded.includes(+id))
                          ?.map(tier=>({
                            ...tier,
                            steps: sessionSteps
                                    .filter(({id, state}) => tier.steps_id.includes(id) && state !== "VALIDATED")
                          }))
                          ?.filter(({steps})=> steps?.length) || [];

    dispatch(changeCurrentKycSteps(missingSteps))
  }

  return {
    validateKycSteps,
  }
}
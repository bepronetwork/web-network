import {useRouter} from "next/router";

import {IssueBigNumberData, PullRequest} from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

import PullRequestHeroView from "./view";

interface PullRequestHeroControllerProps {
  currentPullRequest: PullRequest;
  currentBounty: IssueBigNumberData;
}

export default function PullRequestHero({currentPullRequest, currentBounty}: PullRequestHeroControllerProps) {
  const router = useRouter();
  
  const { getURLWithNetwork } = useNetwork();

  function handleBack() {
    router.push(getURLWithNetwork("/bounty/[id]", {
      id: currentBounty?.id
    }))
  }

  return (
    <PullRequestHeroView 
      currentPullRequest={currentPullRequest} 
      currentBounty={currentBounty} 
      handleBack={handleBack}    
    />
  );
}

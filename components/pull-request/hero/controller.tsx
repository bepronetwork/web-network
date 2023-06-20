import {useRouter} from "next/router";

import {IssueBigNumberData, pullRequest} from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

import PullRequestHeroView from "./view";

interface PullRequestHeroControllerProps {
  currentPullRequest: pullRequest;
  currentBounty: IssueBigNumberData;
}

export default function PullRequestHero({currentPullRequest, currentBounty}: PullRequestHeroControllerProps) {
  const router = useRouter();
  
  const { getURLWithNetwork } = useNetwork();

  function handleBack() {
    router.push(getURLWithNetwork("/bounty", {
      id: currentBounty?.githubId,
      repoId: currentBounty?.repository_id,
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

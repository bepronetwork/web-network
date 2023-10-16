import {useRouter} from "next/router";

import {Deliverable, IssueBigNumberData} from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

import DeliverableHeroView from "./view";

interface DeliverableHeroControllerProps {
  currentDeliverable: Deliverable;
  currentBounty: IssueBigNumberData;
}

export default function DeliverableHero({currentDeliverable, currentBounty}: DeliverableHeroControllerProps) {
  const router = useRouter();
  
  const { getURLWithNetwork } = useNetwork();

  function handleBack() {
    router.push(getURLWithNetwork("/bounty/[id]", {
      id: currentBounty?.id
    }))
  }

  return (
    <DeliverableHeroView 
      currentDeliverable={currentDeliverable} 
      currentBounty={currentBounty} 
      handleBack={handleBack}    
    />
  );
}

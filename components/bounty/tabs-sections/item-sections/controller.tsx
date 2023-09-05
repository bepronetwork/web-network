import ItemSectionsView from "components/bounty/tabs-sections/item-sections/view";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

interface ItemProps {
  data: Proposal[] | PullRequest[],
  isProposal: boolean,
  currentBounty: IssueBigNumberData;
}

export default function ItemSections({ data, isProposal, currentBounty }: ItemProps) {
  return (
    <ItemSectionsView 
      data={data} 
      isProposal={isProposal} 
      currentBounty={currentBounty}  
    />
  )
}
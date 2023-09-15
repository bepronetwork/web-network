import DeliverableDetailsView from "components/proposal/deliverable-details/view";

import { Deliverable, IssueBigNumberData, IssueData } from "interfaces/issue-data";

import { useNetwork } from "x-hooks/use-network";

interface ProposalDeliverableDetailsProps {
  deliverable: Deliverable;
  issue: IssueData | IssueBigNumberData;
}

export default function ProposalDeliverableDetails({
  deliverable,
  issue,
}: ProposalDeliverableDetailsProps) {
  const { getURLWithNetwork } = useNetwork();

  // TODO BEPRO-1679: Change pull request path /pull-request/[id]
  const deliverableHref = getURLWithNetwork("deliverable", {
    id: issue?.id,
    deliverableId: deliverable.id,
  });

  return(
    <DeliverableDetailsView
      id={deliverable?.id}
      createdAt={deliverable?.createdAt}
      isMerged={deliverable?.accepted}
      isMergeable={!deliverable?.canceled && deliverable?.markedReadyForReview}
      deliverableHref={deliverableHref}
      deliverableUrl={deliverable?.deliverableUrl} 
      user={deliverable?.user}    
      />
  );
}
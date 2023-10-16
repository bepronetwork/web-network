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

  const deliverableHref = getURLWithNetwork("/bounty/[id]/deliverable/[deliverableId]", {
    id: issue?.id,
    deliverableId: deliverable.id,
  });

  return(
    <DeliverableDetailsView
      id={deliverable?.id}
      createdAt={deliverable?.createdAt}
      deliverableHref={deliverableHref}
      deliverableTitle={deliverable?.title}
      user={deliverable?.user}    
    />
  );
}
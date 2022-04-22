import readProposalCreated from "helpers/api/proposal/read-created";
import readProposalDisputed from "helpers/api/proposal/read-disputed";


export const ProposalHelpers = {
  "created": ["getBountyProposalCreatedEvents", readProposalCreated],
  "disputed": ["getBountyProposalDisputedEvents", readProposalDisputed]
};
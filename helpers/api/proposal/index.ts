import readProposalCreated from "helpers/api/proposal/read-created";
import readProposalDisputed from "helpers/api/proposal/read-disputed";
import readProposalRefused from "helpers/api/proposal/read-refused";


export const ProposalHelpers = {
  "created": ["getBountyProposalCreatedEvents", readProposalCreated],
  "disputed": ["getBountyProposalDisputedEvents", readProposalDisputed],
  "refused": ["getBountyProposalRefusedEvents", readProposalRefused]
};
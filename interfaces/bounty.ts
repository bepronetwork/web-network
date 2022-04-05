import { Bounty, Proposal } from "@taikai/dappkit";

export interface BountyExtended extends Bounty {
    isDraft?: boolean;
    isFinished?: boolean;
    proposals: ProposalExtended[];
}

export interface ProposalExtended extends Proposal {
    isDisputed?: boolean;
}
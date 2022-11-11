import { PullRequest, Benefactor, ProposalDetail, Bounty, Proposal } from "@taikai/dappkit";
import BigNumber from "bignumber.js";

import { Token } from "interfaces/token";

export interface BountyExtended extends Bounty {
    id: number;
    creationDate: number;
    tokenAmount: BigNumber;

    creator: string;
    transactional: string;
    rewardToken: string;
    rewardAmount: BigNumber;
    fundingAmount: BigNumber;
    fundedAmount: BigNumber;
    fundedPercent: BigNumber;

    closed: boolean;
    canceled: boolean;
    funded: boolean;

    title: string;
    repoPath: string;
    branch: string;
    cid: string;
    githubUser: string;

    closedDate: number;

    pullRequests: PullRequest[];
    funding: BenefactorExtended[];

    isDraft?: boolean;
    isFinished?: boolean;
    isInValidation?: boolean;
    isFundingRequest?: boolean;
    proposals: ProposalExtended[];

    transactionalTokenData?: Token;
    rewardTokenData?: Token;
}

export interface ProposalExtended extends Proposal {
    id: number;
    creationDate: number;
    oracles: number;
    disputeWeight: BigNumber;
    prId: number;
    refusedByBountyOwner: boolean;
    creator: string;

    details: ProposalDetail[];

    isDisputed?: boolean;
    canUserDispute?: boolean;
}

export interface BenefactorExtended extends Benefactor {
    id: number;
    amount: BigNumber;
    benefactor: string;
    creationDate: number;
}
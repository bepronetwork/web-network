export type TypeComment = 'issue' | 'deliverable' | 'proposal';

export interface IdsComment {
    issueId: number;
    proposalId?: number;
    deliverableId?: number;
}
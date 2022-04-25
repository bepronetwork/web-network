export enum TransactionTypes {
  unknown = -1,
  lock,
  unlock,
  approveTransactionalERC20Token,
  openIssue,
  delegateOracles,
  takeBackOracles,
  proposeMerge,
  dispute,
  closeIssue,
  redeemIssue,
  approveSettlerToken,
  recognizedAsFinish,
  createPullRequest,
  makePullRequestReady,
  updateBountyAmount
}

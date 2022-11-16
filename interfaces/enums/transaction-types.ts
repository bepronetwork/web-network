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
  updateBountyAmount,
  cancelPullRequest,
  refuseProposal,
  deployNetworkV2,
  setNFTDispatcher,
  addNetworkToRegistry,
  deployBountyToken,
  setDraftTime,
  setDisputableTime,
  setPercentageNeededForDispute,
  setCouncilAmount,
  fundBounty,
  retractFundBounty,
  withdrawFundRewardBounty,  
  deployERC20Token,
  configFees,
  deployNetworkRegistry
}

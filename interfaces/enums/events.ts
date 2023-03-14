export enum RegistryEvents {
  NetworkRegistered = "NetworkRegistered",
  NetworkClosed = "NetworkClosed",
  LockedAmountChanged = "UserLockedAmountChanged",
  ChangedFee = "ChangedFee",
  ChangeAllowedTokens = "ChangeAllowedTokens",
  LockFeeChanged = "LockFeeChanged"
}

export enum NetworkEvents {
  BountyCreated = "BountyCreated",
  BountyCanceled = "BountyCanceled",
  BountyFunded = "BountyFunded",
  BountyClosed = "BountyClosed",
  BountyUpdated = "BountyAmountUpdated",
  PullRequestCreated = "BountyPullRequestCreated",
  PullRequestReady = "BountyPullRequestReadyForReview",
  PullRequestCanceled = "BountyPullRequestCanceled",
  ProposalCreated = "BountyProposalCreated",
  ProposalDisputed = "BountyProposalDisputed",
  ProposalRefused = "BountyProposalRefused",
  OraclesChanged = "OraclesChanged",
  OraclesTransfer = "OraclesTransfer"
}

export enum StandAloneEvents {
  UpdateBountiesToDraft = "UpdateBountiesToDraft",
  UpdateNetworkParams = "UpdateNetworkParams",
  BountyMovedToOpen = "BountyMovedToOpen",
  WithdrawReward = "WithdrawReward"
}
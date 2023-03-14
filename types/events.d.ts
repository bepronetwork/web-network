export type RegistryEvents = 
  "NetworkRegistered" |
  "NetworkClosed" |
  "UserLockedAmountChanged" |
  "ChangedFee" |
  "ChangeAllowedTokens" |
  "LockFeeChanged";

export type NetworkEvents =
  "BountyCreated" |
  "BountyCanceled" |
  "BountyFunded" |
  "BountyClosed" |
  "BountyPullRequestCreated" |
  "BountyPullRequestReadyForReview" |
  "BountyPullRequestCanceled" |
  "BountyProposalCreated" |
  "BountyProposalDisputed" |
  "BountyProposalRefused" |
  "BountyAmountUpdated" |
  "OraclesChanged" |
  "OraclesTransfer";

export type StandAloneEvents =
  "UpdateBountiesToDraft" |
  "UpdateNetworkParams" |
  "BountyMovedToOpen" |
  "WithdrawReward";
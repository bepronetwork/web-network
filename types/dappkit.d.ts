export type NetworkParameters = "councilAmount" | 
  "disputableTime" | 
  "draftTime" | 
  "oracleExchangeRate" | 
  "mergeCreatorFeeShare" | 
  "proposerFeeShare" |
  "percentageNeededForDispute" |
  "cancelableTime";

export type RegistryParameters = "networkCreationFeePercentage" | 
  "lockAmountForNetworkCreation" | 
  "totalLockedAmount" | 
  "closeFeePercentage" | 
  "cancelFeePercentage" | 
  "treasury" |
  "erc20" |
  "MAX_LOCK_PERCENTAGE_FEE" |
  "DIVISOR" ;

export type Entities = "bounty" | "proposal" | "pull-request" | "registry" | "oracles" | "network";

export type Events = "created" | 
  "canceled" | 
  "closed" | 
  "disputed" | 
  "ready" | 
  "updated" | 
  "refused" | 
  "funded" | 
  "changed" |
  "transfer" |
  "registered"|
  "moved-to-open" |
  "update-draft-time" |
  "parameters" |
  "withdraw";
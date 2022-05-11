import {changeAccessToken} from '@reducers/change-access-token';

export enum ReduceActionName {
  GithubHandle = `GithubHandle`,
  MetaMaskWallet = `MetaMaskWallet`,
  Loading = `Loading`,
  BeproInit = `BeproInit`,
  MyIssues = `MyIssues`,
  Oracles = `Oracles`,
  Staked = `Staked`,
  ChangeAddress = `ChangeAddress`,
  ChangeBalance = `ChangeBalance`,
  AddToast = `AddToast`,
  RemoveToast = `RemoveToast`,
  MyTransactions = `MyTransactions`,
  AddTransactions = `AddTransactions`,
  UpdateTransaction = `UpdateTransaction`,
  ChangeMicroServiceReadyState = `ChangeMicroServiceReadyState`,
  ChangeNetwork = `ChangeNetwork`,
  GithubLogin = `GithubLogin`,
  ChangeAccessToken = `ChangeAccessToken`,
  ChangeTransactionalTokenApproval = `ChangeTransactionalTokenApproval`,
  ChangeSettlerTokenApproval = `ChangeSettlerTokenApproval`,
}

import { 
  ERC20,
  Bounty,
  Defaults,
  Network_v2,
  BountyToken,
  TreasuryInfo,
  OraclesResume,
  Web3Connection,
  NetworkRegistry
} from "@taikai/dappkit";
import {PromiEvent, TransactionReceipt} from "web3-core";
import {Contract} from "web3-eth-contract";

import { Token } from "interfaces/token";

import { NetworkParameters } from "types/dappkit";

interface DAOServiceProps {
  skipWindowAssignment?: boolean;
  web3Connection?: Web3Connection;
  web3Host?: string;
  registryAddress?: string;
}

type ResolveReject = (values?: any) => void

export default class DAO {
  private _web3Connection: Web3Connection;
  private _network: Network_v2;
  private _registry: NetworkRegistry;
  private _web3Host: string;
  private _registryAddress: string;

  get web3Connection() { return this._web3Connection; }
  get network() { return this._network; }
  get registry() { return this._registry; }
  get web3Host() { return this._web3Host; }
  get registryAddress() { return this._registryAddress; }

  constructor({ skipWindowAssignment, web3Connection, web3Host, registryAddress } : DAOServiceProps = {}) {
    if (!web3Host && !web3Connection)
      throw new Error("Missing web3 provider URL or web3 connection");

    this._web3Host = web3Host;
    this._registryAddress = registryAddress;

    this._web3Connection = web3Connection || new Web3Connection({
      web3Host,
      skipWindowAssignment
    });
  }

  async loadNetwork(networkAddress: string, skipAssignment?: boolean): Promise<Network_v2 | boolean> {
    try {
      if (!networkAddress) throw new Error("Missing Network_v2 Contract Address");

      const network = new Network_v2(this.web3Connection, networkAddress);

      await network.loadContract();

      if (!skipAssignment) this._network = network;

      return network;
    } catch (error) {
      console.log(`Error loading Network_v2 (${networkAddress}): `, error);
    }

    return false;
  }

  async loadRegistry(skipAssignment?: boolean): Promise<NetworkRegistry | boolean> {
    try {
      if (!this.registryAddress) 
        throw new Error("Missing Network_Registry Contract Address");

      const registry = new NetworkRegistry(this.web3Connection, this.registryAddress);

      await registry.loadContract();

      if (!skipAssignment) this._registry = registry;

      return registry;
    } catch (error) {
      console.log("Error loading NetworkRegistry: ", error);
    }

    return false;
  }

  async loadERC20(tokenAddress: string): Promise<ERC20> {
    const erc20 = new ERC20(this.web3Connection, tokenAddress);

    await erc20.loadContract();

    return erc20;
  }

  async loadBountyToken(tokenAddress: string): Promise<BountyToken> {
    const token = new BountyToken(this.web3Connection, tokenAddress);

    await token.loadContract();

    return token;
  }


  transactionHandler(event: PromiEvent<TransactionReceipt | Contract>,
                    resolve: ResolveReject,
                    reject: ResolveReject,
                    debug = false) {
    let _iban: string;
    let tries = 1;
    const maxTries = 60; // 1 per second

    const getTx = async (hash: string) =>
      this.web3Connection.eth.getTransactionReceipt(hash);

    const handleTransaction = (tx: any) => {
      if (!tx) {
        if (tries === maxTries)
          reject({
            message: `Failed to fetch transaction ${_iban} within ${maxTries}`,
          });
        else {
          tries += 1;
          startTimeout(_iban);
        }
      } else {
        resolve(tx);
      }
    };

    const startTimeout = (hash: string) =>
    setTimeout(() => getTx(hash).then(handleTransaction), 1000);


    event.once(`transactionHash`, async (hash) => {
      try {
        _iban = hash;
        startTimeout(hash);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });

    event.once('error', (error) => { reject(error); });
  }

  async start(): Promise<boolean> {
    try {
      await this.web3Connection.start();

      return true;
    } catch (error) {
      console.log("Error starting: ", error);
    }

    return false;
  }

  async connect(): Promise<boolean> {
    try {
      await this.web3Connection.connect();

      await this.loadNetwork(this.network?.contractAddress);

      return true;
    } catch (error) {
      console.log("Error logging in: ", error);
    }

    return false;
  }

  async getAddress(): Promise<string> {
    return this.web3Connection.getAddress();
  }

  async getChainId(): Promise<number> {
    return this.web3Connection.web3.eth.getChainId();
  }

  async getBalance(kind: `eth` | `settler` | `staked`, address: string): Promise<number> {
    try {
      let n = 0;

      switch (kind) {
      case 'settler':
        n = await this.network.networkToken.getTokenAmount(address);
        break;
      case 'eth':
        n = +this.web3Connection.Web3.utils.fromWei(await this.web3Connection.getBalance());
        break;
      case 'staked':
        n = await this.network.totalNetworkToken();
        break;
      }
      
      return n;
    } catch (error) {
      return 0;
    }
  }

  async getNetworkParameter(parameter: NetworkParameters): Promise<number> {
    return this.network[parameter]();
  }

  async setNetworkParameter(parameter: NetworkParameters, value: number | string): Promise<TransactionReceipt> {    
    if (parameter === "treasury") return this.network.updateTresuryAddress(value);

    return this.network[`change${parameter[0].toUpperCase() + parameter.slice(1)}`](value);
  }

  async getOraclesOf(address: string): Promise<number> {    
    return this.network.getOraclesOf(address);
  }

  async isCouncil(address: string): Promise<boolean> {
    const councilAmount = await this.getNetworkParameter("councilAmount");
    const oraclesOf = await this.getOraclesOf(address);

    return oraclesOf >= councilAmount;
  }

  async getOraclesResume(address: string): Promise<OraclesResume> {
    return this.network.getOraclesResume(address);
  }

  async getBounty(id: number): Promise<Bounty> {
    return this.network.getBounty(id);
  }

  async isBountyInDraft(id: number): Promise<boolean> {
    return this.network.isBountyInDraft(id);
  }

  async isProposalDisputed(bountyId: number, proposalId: number): Promise<boolean> {
    return this.network.isProposalDisputed(bountyId, proposalId);
  }

  async getDisputesOf(address: string, bountyId: number, proposalId: number): Promise<number> {
    return this.network.disputes(address, bountyId, proposalId);
  }

  async getTreasury(): Promise<TreasuryInfo> {
    const treasury = await this.network.treasuryInfo();

    return {
      treasury: treasury?.treasury || Defaults.nativeZeroAddress,
      closeFee: +(treasury?.closeFee || 0),
      cancelFee: +(treasury?.cancelFee || 0)
    };
  }

  async getMergeCreatorFee(): Promise<number> {
    return this.network.mergeCreatorFeeShare();
  }

  async getProposerFee(): Promise<number> {
    return this.network.proposerFeeShare();
  }

  async getBountyByCID(cid: string): Promise<Bounty> {
    return this.network.cidBountyId(cid);
  }

  async getClosedBounties(): Promise<number> {
    return this.network.closedBounties();
  }

  async getOpenBounties(): Promise<number> {
    return this.network.openBounties();
  }

  async getTotalBounties(): Promise<number> {
    return this.network.bountiesIndex();
  }

  async getBountiesOfAddress(address: string): Promise<number[]> {
    return this.network.getBountiesOfAddress(address);
  }

  async getTotalNetworkToken(): Promise<number> {
    return this.network.totalNetworkToken();
  }

  async getNetworksQuantityInRegistry(): Promise<number> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.amountOfNetworks();
  }

  async getAllowedTokens(): Promise<{ transactional: string[]; reward: string[] }> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.getAllowedTokens();
  }

  async addAllowedTokens(addresses: string[], isTransactional: boolean) {
    if (!this.registry) await this.loadRegistry();

    this.web3Connection.options.customTransactionHandler = this.transactionHandler.bind(this) 

    return this.registry.addAllowedTokens(addresses, isTransactional)
                        .finally(() => this.web3Connection.options.customTransactionHandler = null)
  }

  async removeAllowedTokens(addresses: string[], isTransactional: boolean) {
    if (!this.registry) await this.loadRegistry();

    this.web3Connection.options.customTransactionHandler = this.transactionHandler.bind(this) 

    return this.registry.removeAllowedTokens(addresses, isTransactional)
                        .finally(() => this.web3Connection.options.customTransactionHandler = null)
  }

  async updateConfigFees(closeFee: number, cancelFee: number){
    if (!this.registry) await this.loadRegistry();

    return this.registry.changeGlobalFees(closeFee, cancelFee)
  }

  async getTreasuryRegistry(): Promise<string> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.treasury();
  }

  async getTokensLockedInRegistry(): Promise<number> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.totalLockedAmount();
  }

  async isTokenApprovedInRegistry(amount: number): Promise<boolean> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.token.isApproved(this.registry.contractAddress, amount);
  }

  async approveTokenInRegistry(amount: number): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.token.approve(this.registry.contractAddress, amount);
  }

  async lockInRegistry(amount: number): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.lock(amount);
  }

  async unlockFromRegistry(): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.unlock();
  }

  async getTokensLockedInRegistryByAddress(address: string): Promise<number> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.lockedTokensOfAddress(address);
  }

  async getRegistryCreatorAmount(): Promise<number> {
    if (!this.registry) await this.loadRegistry();
      
    return this.registry.lockAmountForNetworkCreation();
  }

  async isRegistryGovernor(address: string): Promise<boolean> {
    if (!this.registry) await this.loadRegistry();

    const governor = await this.registry.governed._governor();
    return governor === address;
  }

  async isNetworkGovernor(address: string): Promise<boolean> {
    const governor = await this.network.governed._governor();

    return governor === address;
  }

  async isNetworkAbleToBeClosed(): Promise<boolean> {
    const [totalNetworkToken, closedBounties, canceledBounties, bountiesTotal] = 
      await Promise.all([
        this.network.totalNetworkToken(),
        this.network.closedBounties(),
        this.network.canceledBounties(),
        this.network.bountiesIndex()
      ]);

    return (
      totalNetworkToken === 0 &&
      closedBounties + canceledBounties === bountiesTotal
    );
  }

  async getERC20TokenData(tokenAddress: string): Promise<Token> {
    const token = await this.loadERC20(tokenAddress);

    return {
      name: await token.name(),
      symbol: await token.symbol(),
      address: tokenAddress
    };
  }

  async getSettlerTokenData(): Promise<Token> {
    return this.getERC20TokenData(this.network.networkToken.contractAddress);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<number> {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.getTokenAmount(walletAddress);
  }

  async getAllowance(tokenAddress: string, walletAddress: string, spenderAddress: string): Promise<number> {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.allowance(walletAddress, spenderAddress);
  }

  async getSettlerTokenAllowance(walletAddress: string): Promise<number> {

    return this.getAllowance(this.network.networkToken.contractAddress, 
                             walletAddress, 
                             this.network.contractAddress);
  }

  async deployBountyToken(name: string, symbol: string): Promise<TransactionReceipt> {
    const deployer = new BountyToken(this.web3Connection);

    await deployer.loadAbi();

    return deployer.deployJsonAbi(name, symbol);
  }

  async deployERC20Token(name: string, symbol: string, cap: string, ownerAddress: string): Promise<TransactionReceipt> {
    const deployer = new ERC20(this.web3Connection);

    await deployer.loadAbi();

    return deployer.deployJsonAbi(name, symbol, cap, ownerAddress);
  }

  async openBounty({
    cid,
    title,
    repoPath,
    branch,
    githubUser = "",
    transactional,
    rewardToken = Defaults.nativeZeroAddress,
    tokenAmount = 0,
    rewardAmount = 0,
    fundingAmount = 0
  }): Promise<TransactionReceipt> {
    return this.network.openBounty(tokenAmount,
                                   transactional,
                                   rewardToken,
                                   rewardAmount,
                                   fundingAmount,
                                   cid,
                                   title,
                                   repoPath,
                                   branch,
                                   githubUser);
  }

  async fundBounty(bountyId: number, amount: number, tokenDecimals?: number): Promise<TransactionReceipt> {
    return this.network.fundBounty(bountyId, amount, tokenDecimals);
  }

  async retractFundBounty(bountyId: number, fundingId: number): Promise<TransactionReceipt> {
    return this.network.retractFunds(bountyId, [fundingId]);
  }

  async withdrawFundRewardBounty(bountyId: number, fundingId: number): Promise<TransactionReceipt> {
    return this.network.withdrawFundingReward(bountyId, fundingId);
  }

  async disputeProposal(bountyId: number, proposalId: number): Promise<TransactionReceipt> {
    return this.network.disputeBountyProposal(bountyId, proposalId);
  }

  async closeBounty(bountyId: number, proposalId: number): Promise<TransactionReceipt> {
    return this.network.closeBounty(bountyId, proposalId);
  }

  async updateBountyAmount(bountyId: number, amount: number): Promise<TransactionReceipt> {
    return this.network.updateBountyAmount(bountyId, amount);
  }

  async cancelBounty(bountyId: number): Promise<TransactionReceipt> {
    return this.network.cancelBounty(bountyId);
  }

  async createPullRequest(bountyId: number,
    originRepo: string,
    originBranch: string,
    originCID: string,
    userRepo: string,
    userBranch: string,
    cid: number): Promise<TransactionReceipt> {

    return this.network.createPullRequest(bountyId,
                                          originRepo,
                                          originBranch,
                                          originCID,
                                          userRepo,
                                          userBranch,
                                          cid);
  }

  async setPullRequestReadyToReview(bountyId: number, pullRequestId: number): Promise<TransactionReceipt> {
    return this.network.markPullRequestReadyForReview(bountyId, pullRequestId);
  }

  async cancelPullRequest(bountyId: number, pullRequestId: number): Promise<TransactionReceipt> {
    return this.network.cancelPullRequest(bountyId, pullRequestId);
  }

  async createProposal(bountyId, pullRequestId, addresses: string[], amounts: number[]): Promise<TransactionReceipt> {
    return this.network.createBountyProposal(bountyId, pullRequestId, addresses, amounts);
  }

  async refuseProposal(bountyId: number, proposalId: number): Promise<TransactionReceipt> {
    return this.network.refuseBountyProposal(bountyId, proposalId);
  }

  async approveToken(tokenAddress: string = undefined, amount: number) {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.approve(this.network.contractAddress, amount);
  }

  async takeBackDelegation(delegationId: number): Promise<TransactionReceipt> {
    return this.network.takeBackOracles(delegationId);
  }

  async deployNetworkV2(networkToken: string): Promise<TransactionReceipt> {
    const registryAddress: string = this._registryAddress

    const newNetwork = new Network_v2(this.web3Connection);
    await newNetwork.loadAbi();

    return newNetwork.deployJsonAbi(networkToken,  registryAddress);
  }

  async addNetworkToRegistry(networkAddress: string): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.registerNetwork(networkAddress);
  }

  async getNetworkAdressByCreator(address: string): Promise<string> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.networkOfAddress(address);
  }

  async hasNetworkRegistered(walletAddress: string): Promise<boolean> {
    const networkAddress = await this.getNetworkAdressByCreator(walletAddress);

    return networkAddress !== Defaults.nativeZeroAddress;
  }

  async hardCancel(bountyId: number): Promise<TransactionReceipt>{
    return this.network.hardCancel(bountyId);
  }

  async setNFTTokenDispatcher(nftToken: string, dispatcher: string): Promise<TransactionReceipt> {
    const bountyToken = await this.loadBountyToken(nftToken);

    return bountyToken.setDispatcher(dispatcher);
  }

  toWei(n: string | number): Promise<string> {
    return this.web3Connection.Web3.utils.toWei(n.toString(), `ether`);
  }

  isAddress(address: string): Promise<boolean> {
    return this.web3Connection.utils.isAddress(address);
  }

  async getTimeChain(): Promise<number> { 
    return this.web3Connection.Web3.eth.getBlock(`latest`).then(block => block.timestamp*1000);
  }

  async isBountyInDraftChain(creationDateIssue: number): Promise<boolean> { 
    const time = await this.getTimeChain();
    const redeemTime = await this.network.draftTime();

    return (new Date(time) < new Date(creationDateIssue + redeemTime))
  }

  getCancelableTime(): Promise<number> {
    return this._network.cancelableTime();
  }
}
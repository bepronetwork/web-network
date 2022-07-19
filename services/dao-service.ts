import { 
  ERC20,
  Bounty,
  Defaults,
  Network_v2,
  BountyToken,
  TreasuryInfo,
  OraclesResume,
  Web3Connection,
  Network_Registry
} from "@taikai/dappkit";
import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import getConfig from "next/config";

import { Token } from "interfaces/token";

import { NetworkParameters } from "types/dappkit";

const { publicRuntimeConfig } = getConfig();

export default class DAO {
  private _web3Connection: Web3Connection;
  private _network: Network_v2;
  private _networkAux: Network_v2;
  private _registry: Network_Registry;

  get web3Connection() { return this._web3Connection; }
  get network() { return this._network; }
  get networkAux() { return this._networkAux; }
  get registry() { return this._registry; }

  constructor(skipWindowAssignment = false) {
    if (!publicRuntimeConfig?.web3ProviderConnection)
      throw new Error("Missing web3ProviderConnection in next.config.js");

    this._web3Connection = new Web3Connection({
      web3Host: publicRuntimeConfig.web3ProviderConnection,
      skipWindowAssignment
    });
  }

  async loadNetwork(networkAddress: string = publicRuntimeConfig?.contract?.address, 
                    skipAssignment?: boolean): Promise<Network_v2 | boolean> {
    try {
      if (!networkAddress) throw new Error("Missing Network_v2 Contract Address");

      const network = new Network_v2(this.web3Connection, networkAddress);

      await network.loadContract();

      if (!skipAssignment) this._network = network;
      else this._networkAux = network;

      return network;
    } catch (error) {
      console.log(`Error loading Network_v2 (${networkAddress}): `, error);
    }

    return false;
  }

  async loadRegistry(skipAssignment?: boolean): Promise<Network_Registry | boolean> {
    try {
      if (!publicRuntimeConfig?.contract?.registry) 
        throw new Error("Missing Network_Registry Contract Address");

      const registry = new Network_Registry(this.web3Connection, publicRuntimeConfig.contract.registry);

      await registry.loadContract();

      if (!skipAssignment) this._registry = registry;

      return registry;
    } catch (error) {
      console.log("Error loading Network_Registry: ", error);
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

  async start(): Promise<boolean> {
    try {
      await this.web3Connection.start();

      console.table({
        Network_v2: publicRuntimeConfig?.contract?.address,
        Settler: publicRuntimeConfig?.contract?.settler,
        Transactional: publicRuntimeConfig?.contract?.transaction,
        Network_Registry: publicRuntimeConfig?.contract?.registry
      });

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

  async getNetwork(networkAddress: string = undefined): Promise<Network_v2> {
    if (!networkAddress || (this.network && this.network?.contractAddress === networkAddress)) return this._network;
    if (networkAddress && this.networkAux && this.networkAux?.contractAddress === networkAddress) 
      return this._networkAux;

    const network = await this.loadNetwork(networkAddress, true);

    return network;
  }

  async getBalance(kind: `eth` | `settler` | `staked`, address: string): Promise<number> {
    try {
      let n = 0;

      switch (kind) {
      case 'settler':
        n = await this.network.settlerToken.getTokenAmount(address);
        break;
      case 'eth':
        n = +this.web3Connection.Web3.utils.fromWei(await this.web3Connection.getBalance());
        break;
      case 'staked':
        n = await this.network.totalSettlerLocked();
        break;
      }
      
      return n;
    } catch (error) {
      return 0;
    }
  }

  async getNetworkParameter(parameter: NetworkParameters, networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network[parameter]();
  }

  async setNetworkParameter(parameter: NetworkParameters, 
                            value: number | string, 
                            networkAddress?: string): Promise<TransactionReceipt> {    
    const network = await this.getNetwork(networkAddress);

    if (parameter === "treasury") return network.updateTresuryAddress(value);

    return network[`change${parameter[0].toUpperCase() + parameter.slice(1)}`](value);
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

  async getTreasury(networkAddress?: string): Promise<TreasuryInfo> {
    const network = await this.getNetwork(networkAddress);
    const treasury = await network.treasuryInfo();

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

  async getClosedBounties(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.closedBounties();
  }

  async getOpenBounties(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.openBounties();
  }

  async getTotalBounties(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.bountiesIndex();
  }

  async getBountiesOfAddress(address: string): Promise<number[]> {
    return this.network.getBountiesOfAddress(address);
  }

  async getTotalSettlerLocked(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.totalSettlerLocked();
  }

  async getNetworksQuantityInRegistry(): Promise<number> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.amountOfNetworks();
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

  async isNetworkAbleToBeClosed(networkAddress?: string): Promise<boolean> {
    const network = await this.getNetwork(networkAddress);

    const [totalSettlerLocked, closedBounties, canceledBounties, bountiesTotal] = 
      await Promise.all([
        network.totalSettlerLocked(),
        network.closedBounties(),
        network.canceledBounties(),
        network.bountiesIndex()
      ]);

    return (
      totalSettlerLocked === 0 &&
      closedBounties + canceledBounties === bountiesTotal
    );
  }

  async getERC20TokenData(tokenAddress): Promise<Token> {
    const token = await this.loadERC20(tokenAddress);

    return {
      name: await token.name(),
      symbol: await token.symbol(),
      address: tokenAddress
    };
  }

  async getSettlerTokenData(networkAddress?: string): Promise<Token> {
    const network = await this.getNetwork(networkAddress);

    return this.getERC20TokenData(network.settlerToken.contractAddress);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<number> {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.getTokenAmount(walletAddress);
  }

  async getAllowance(tokenAddress: string, 
                     walletAddress: string, 
                     spenderAddress: string): Promise<number> {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.allowance(walletAddress, spenderAddress);
  }

  async getSettlerTokenAllowance(walletAddress: string): Promise<number> {

    return this.getAllowance(this.network.settlerToken.contractAddress, 
                             walletAddress, 
                             this.network.contractAddress);
  }

  async deployBountyToken(name: string, symbol: string): Promise<TransactionReceipt> {
    const deployer = new BountyToken(this.web3Connection);

    await deployer.loadAbi();

    return deployer.deployJsonAbi(name, symbol);
  }

  async openBounty({
    cid,
    title,
    repoPath,
    branch,
    githubUser,
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

  async deployNetworkV2(networkToken: string = publicRuntimeConfig?.contract?.settler, 
    nftToken: string = publicRuntimeConfig?.contract?.nft, 
    nftUri = publicRuntimeConfig?.nftUri || "//",
    treasuryAddress = Defaults.nativeZeroAddress,
    cancelFee = 10000,
    closeFee= 50000): Promise<TransactionReceipt> {
    const newNetwork = new Network_v2(this.web3Connection);

    await newNetwork.loadAbi();

    return newNetwork.deployJsonAbi(networkToken, nftToken, nftUri, treasuryAddress, cancelFee, closeFee);
  }

  async addNetworkToRegistry(networkAddress: string): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.registerNetwork(networkAddress);
  }

  async getNetworkAdressByCreator(address: string): Promise<string> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.networkOfAddress(address);
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
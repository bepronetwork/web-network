import {
  Bounty,
  BountyToken,
  Defaults,
  ERC20,
  Network_v2,
  NetworkRegistry,
  toSmartContractDecimals,
  TreasuryInfo,
  Web3Connection
} from "@taikai/dappkit";
import {TransactionReceipt} from "@taikai/dappkit/dist/src/interfaces/web3-core";
import BigNumber from "bignumber.js";
import {PromiEvent, TransactionReceipt as TransactionReceiptWeb3Core, provider as Provider} from "web3-core";
import {Contract} from "web3-eth-contract";

import {BountyExtended} from "interfaces/bounty";
import {OraclesResumeExtended} from "interfaces/oracles-state";
import {Token} from "interfaces/token";

import {NetworkParameters, RegistryParameters} from "types/dappkit";

interface DAOServiceProps {
  skipWindowAssignment?: boolean;
  web3Connection?: Web3Connection;
  web3Host?: string;
  registryAddress?: string;
  provider?: Provider;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  constructor({ skipWindowAssignment, web3Connection, web3Host, registryAddress, provider } : DAOServiceProps = {}) {
    if (!web3Host && !web3Connection && !provider)
      throw new Error("Missing web3 provider URL, web3 connection or provider object");

    this._web3Host = web3Host;
    this._registryAddress = registryAddress;

    this._web3Connection = web3Connection || new Web3Connection({
      web3Host,
      web3CustomProvider: provider,
      skipWindowAssignment
    });
  }

  async loadNetwork(networkAddress: string, skipAssignment?: boolean): Promise<Network_v2 | boolean> {
    try {
      if (!networkAddress) throw new Error("Missing Network_v2 Contract Address");

      const network = new Network_v2(this.web3Connection, networkAddress);

      await network.loadContract();

      if (!skipAssignment)
        this._network = network;

      console.table({
        networkAddress,
        networkTokenAddress: network.networkToken?.contractAddress,
        registryAddress: network.registry?.contractAddress,
        nftAddress: network.nftToken?.contractAddress,
      });


      return network;
    } catch (error) {
      console.debug(`Error loading Network_v2 (${networkAddress}): `, error);
    }

    return false;
  }

  async loadRegistry(skipAssignment?: boolean, registryAddress?: string): Promise<NetworkRegistry | boolean> {
    try {
      if (!this.registryAddress && !registryAddress) 
        throw new Error("Missing Network_Registry Contract Address");

      const registry = new NetworkRegistry(this.web3Connection, registryAddress || this.registryAddress);

      await registry.loadContract();

      if (!skipAssignment) this._registry = registry;

      return registry;
    } catch (error) {
      console.debug("Error loading NetworkRegistry: ", registryAddress || this.registryAddress, error);
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

  async isNetworkRegistry(contractAddress: string): Promise<boolean> {
    try {
      return !!(await this.loadRegistry(true, contractAddress));
    } catch(e) {
      console.debug("isNetworkRegistry", e);
    }

    return false;
  }

  async isERC20(contractAddress: string): Promise<boolean> {
    try {
      return !!(await this.loadERC20(contractAddress));
    } catch(e) {
      console.debug("isERC20", e);
    }

    return false;
  }

  async isBountyToken(contractAddress: string): Promise<boolean> {
    try {
      return !!(await this.loadBountyToken(contractAddress));
    } catch(e) {
      console.debug("isBountyToken", e);
    }

    return false;
  }


  transactionHandler(event: PromiEvent<TransactionReceiptWeb3Core | Contract>,
                    resolve: ResolveReject,
                    reject: ResolveReject) {
    let _iban: string;
    let tries = 1;
    const maxTries = 60; // 1 per second

    const getTx = async (hash: string) =>
      this.web3Connection.eth.getTransactionReceipt(hash);

    const startTimeout = (hash: string) =>
      setTimeout(() => getTx(hash).then(handleTransaction), 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      console.debug("Error starting: ", error);
    }

    return false;
  }

  async connect(): Promise<boolean> {
    try {
      await this.web3Connection.connect();

      //await this.loadNetwork(this.network?.contractAddress);

      return true;
    } catch (error) {
      console.debug("Error logging in: ", error);
    }

    return false;
  }

  async getAddress(): Promise<string> {
    return this.web3Connection.getAddress();
  }

  async getChainId(): Promise<number> {
    return this.web3Connection.web3.eth.getChainId();
  }

  async getBalance(kind: `eth` | `settler` | `staked`, address: string): Promise<BigNumber> {
    let n = new BigNumber("0");
    try {
      const decimals = +this.network.networkToken.decimals;

      switch (kind) {
      case 'settler':
        n = new BigNumber(await this.network.networkToken.getTokenAmount(address)).decimalPlaces(decimals);
        break;
      case 'eth':
        n = new BigNumber(this.web3Connection.Web3.utils.fromWei(await this.web3Connection.getBalance()));
        break;
      case 'staked':
        n = new BigNumber(await this.network.totalNetworkToken()).decimalPlaces(decimals);
        break;
      }
    } catch (error) {
      console.debug(`Failed to getBalance of ${kind} from ${address}`, error);
    }

    return n;
  }

  async getNetworkParameter(parameter: NetworkParameters): Promise<string | number> {
    return this.network[parameter]();
  }

  async getRegistryParameter(parameter: RegistryParameters): Promise<string | number> {
    if (!this.registry) await this.loadRegistry();
    
    return this.registry[parameter]();
  }

  async setNetworkParameter(parameter: NetworkParameters, value: number | string): Promise<TransactionReceipt> {    
    return this.network[`change${parameter[0].toUpperCase() + parameter.slice(1)}`](value);
  }

  async getOraclesOf(address: string): Promise<BigNumber> { 
    const oracles = await this.network.getOraclesOf(address);
    
    return new BigNumber(oracles);
  }

  async isCouncil(address: string): Promise<boolean> {
    const councilAmount = await this.getNetworkParameter("councilAmount");
    const oraclesOf = await this.getOraclesOf(address);

    return oraclesOf.gte(councilAmount);
  }

  async getOraclesResume(address: string): Promise<OraclesResumeExtended> {
    const resume = await this.network.getOraclesResume(address);
    
    return {
      ...resume,
      locked: new BigNumber(resume.locked),
      delegatedToOthers: new BigNumber(resume.delegatedToOthers),
      delegatedByOthers: new BigNumber(resume.delegatedByOthers),
      delegations: resume.delegations.map(delegation => ({ ...delegation, amount: new BigNumber(delegation.amount) }))
    };
  }

  async getBounty(id: number): Promise<BountyExtended> {
    const bounty = await this.network?.getBounty(id);

    return {
      ...bounty,
      tokenAmount: new BigNumber(bounty?.tokenAmount),
      rewardAmount: new BigNumber(bounty?.rewardAmount),
      fundingAmount: new BigNumber(bounty?.fundingAmount),
      proposals: 
        bounty?.proposals.map(proposal => ({ ...proposal, disputeWeight: new BigNumber(proposal.disputeWeight) })),
      funding: 
        bounty?.funding.map(funding => ({ ...funding, amount: new BigNumber(funding.amount) }))
    };
  }

  async isBountyInDraft(id: number): Promise<boolean> {
    return this.network.isBountyInDraft(id);
  }

  async isProposalDisputed(bountyId: number, proposalId: number): Promise<boolean> {
    return this.network.isProposalDisputed(bountyId, proposalId);
  }

  async getDisputesOf(address: string, bountyId: number, proposalId: number): Promise<BigNumber> {
    const disputes = await this.network.disputes(address, bountyId, proposalId);

    return new BigNumber(disputes);
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

  async getTotalNetworkToken(): Promise<BigNumber> {
    const totalNetworkToken = await this.network.totalNetworkToken();

    return new BigNumber(totalNetworkToken);
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

  async updateAmountNetworkCreation(amount: string | number) {
    if (!this.registry) await this.loadRegistry();

    return this.registry.changeAmountForNetworkCreation(amount)
  }

  async updateFeeNetworkCreation(amount: number) {
    if (!this.registry) await this.loadRegistry();

    return this.registry.changeNetworkCreationFee(amount)
  }



  async getTreasuryRegistry(): Promise<string> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.treasury();
  }

  async getTokensLockedInRegistry(): Promise<BigNumber> {
    if (!this.registry) await this.loadRegistry();

    const totalLocked = await this.registry.totalLockedAmount();

    return new BigNumber(totalLocked);
  }

  async isTokenApprovedInRegistry(amount: number): Promise<boolean> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.token.isApproved(this.registry.contractAddress, amount);
  }

  async approveTokenInRegistry(amount: string): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.token.approve(this.registry.contractAddress, amount);
  }

  async lockInRegistry(amount: string): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.lock(amount);
  }

  async unlockFromRegistry(): Promise<TransactionReceipt> {
    if (!this.registry) await this.loadRegistry();

    return this.registry.unlock();
  }

  async getTokensLockedInRegistryByAddress(address: string): Promise<BigNumber> {
    if (!this.registry) await this.loadRegistry();

    const totalLocked = await this.registry.lockedTokensOfAddress(address);

    return new BigNumber(totalLocked);
  }

  async getRegistryCreatorAmount(): Promise<BigNumber> {
    if (!this.registry) await this.loadRegistry();

    const creatorAmount = await this.registry.lockAmountForNetworkCreation();
      
    return new BigNumber(creatorAmount);
  }

  async getRegistryCreatorFee(): Promise<number> {
    if (!this.registry) await this.loadRegistry();

    // networkCreationFeePercentage is aready dived per divisor on sdk
    return await this.registry.networkCreationFeePercentage()
  }

  async isRegistryGovernor(address: string): Promise<boolean> {
    if (!this.registry) await this.loadRegistry();

    const governor = await this.registry.governed._governor();

    return governor.toLowerCase() === address?.toLowerCase();
  }

  async isNetworkGovernor(address: string): Promise<boolean> {
    const governor = await this.network.governed._governor();

    return governor.toLowerCase() === address.toLowerCase();
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
      BigNumber(totalNetworkToken).isEqualTo(0) &&
      closedBounties + canceledBounties === bountiesTotal
    );
  }

  async getERC20TokenData(tokenAddress: string): Promise<Token> {
    const token = await this.loadERC20(tokenAddress);

    return {
      name: await token.name(),
      symbol: await token.symbol(),
      address: tokenAddress,
      decimals: token.decimals,
      totalSupply: BigNumber(await token.totalSupply())
    };
  }

  async getSettlerTokenData(): Promise<Token> {
    return this.getERC20TokenData(this.network.networkToken.contractAddress);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<BigNumber> {
    const erc20 = await this.loadERC20(tokenAddress);

    const balance = await erc20.getTokenAmount(walletAddress);

    return new BigNumber(balance);
  }

  async getAllowance(tokenAddress: string, walletAddress: string, spenderAddress: string): Promise<BigNumber> {
    const erc20 = await this.loadERC20(tokenAddress);

    const allowance = await erc20.allowance(walletAddress, spenderAddress);

    return new BigNumber(allowance);
  }

  async getSettlerTokenAllowance(walletAddress: string): Promise<BigNumber> {

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

    return deployer.deployJsonAbi(name, symbol, toSmartContractDecimals(cap, 18), ownerAddress);
  }

  async deployNetworkRegistry(erc20: string,
                              lockAmountForNetworkCreation: string,
                              treasury: string,
                              lockFeePercentage: string,
                              closeFee: string,
                              cancelFee: string,
                              bountyToken: string): Promise<TransactionReceipt> {
    const deployer = new NetworkRegistry(this.web3Connection);

    await deployer.loadAbi();

    return deployer.deployJsonAbi(erc20,
                                  lockAmountForNetworkCreation,
                                  treasury,
                                  lockFeePercentage,
                                  closeFee,
                                  cancelFee,
                                  bountyToken);
  }

  async openBounty({
    cid,
    title,
    transactional,
    rewardToken = Defaults.nativeZeroAddress,
    tokenAmount = "0",
    rewardAmount = "0",
    fundingAmount = "0"
  }): Promise<TransactionReceipt> {
    return this.network.openBounty( tokenAmount,
                                    transactional,
                                    rewardToken,
                                    rewardAmount,
                                    fundingAmount,
                                    cid,
                                    title,
                                    "",
                                    "",
                                    "");
  }

  async fundBounty(bountyId: number, amount: string, tokenDecimals?: number): Promise<TransactionReceipt> {
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

  async closeBounty(bountyId: number, proposalId: number, tokenUri: string): Promise<TransactionReceipt> {
    return this.network.closeBounty(bountyId, proposalId, tokenUri);
  }

  async updateBountyAmount(bountyId: number, amount: string): Promise<TransactionReceipt> {
    return this.network.updateBountyAmount(bountyId, amount);
  }

  async cancelBounty(bountyId: number, funding: boolean): Promise<TransactionReceipt> {
    return funding ? this.network.cancelFundRequest(bountyId) : this.network.cancelBounty(bountyId);
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

  async approveToken(tokenAddress: string = undefined, amount: string) {
    const erc20 = await this.loadERC20(tokenAddress);

    return erc20.approve(this.network.contractAddress, amount);
  }

  async takeBackDelegation(delegationId: number): Promise<TransactionReceipt> {
    return this.network.takeBackOracles(delegationId);
  }

  async deployNetworkV2(networkToken: string): Promise<TransactionReceipt> {
    const registryAddress: string = this._registryAddress;

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

  isAddress(address: string): boolean {
    return this.web3Connection.utils.isAddress(address);
  }

  async getTimeChain(): Promise<number> { 
    return this.web3Connection.Web3.eth.getBlock(`latest`).then(block => (block?.timestamp || 0) * 1000);
  }

  async isBountyInDraftChain(creationDateIssue: number): Promise<boolean> { 
    try {
      const time = await this.getTimeChain();
      const redeemTime = await this.network.draftTime();

      return (new Date(time) < new Date(creationDateIssue + redeemTime));
    } catch (e) {
      console.error(`Failed to calculate isDraft bounty`, e);
      return null;
    }
  }

  getCancelableTime(): Promise<number> {
    return this._network?.cancelableTime();
  }
}
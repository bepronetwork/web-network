import { 
  Web3Connection, 
  Network_v2, 
  ERC20, 
  NetworkFactory, 
  Bounty, 
  fromSmartContractDecimals, 
  OraclesResume 
} from "@taikai/dappkit";
import { nativeZeroAddress } from "@taikai/dappkit/dist/src/utils/constants";
import getConfig from "next/config";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import {
  BlockTransaction,
  SimpleBlockTransactionPayload
} from "@interfaces/transaction";


const { publicRuntimeConfig } = getConfig()
class BeproFacet {
  readonly bepro: Web3Connection = new Web3Connection({
    web3Host: publicRuntimeConfig.web3ProviderConnection
  });

  network: Network_v2;
  networkFactory: NetworkFactory;

  address: string;

  isStarted = false;
  isLoggedIn = false;
  isNetworkFactoryStarted = false;

  operatorAmount: number;

  async start(networkAddress = CONTRACT_ADDRESS) {
    try {
      if (!this.isStarted) await this.bepro.start();

      this.network = new Network(this.bepro,
        customNetworkAddress || publicRuntimeConfig.contract.address);

      this.erc20 = new ERC20(this.bepro, publicRuntimeConfig.contract.settler);

      await this.network.loadContract();

      this.isStarted = true;

      (window as any).network = this.network;

      console.table({
        web3: WEB3_CONNECTION,
        contract: networkAddress,
        settler: this.network.settlerToken?.contractAddress,
        nft: this.network.nftToken?.contractAddress,
        started: this.isStarted
      });
    } catch (error) {
      console.log("Failed to Start BeproService", error);
    }

    return this.isStarted;
  }

  async startNetworkFactory() {
    try {
      if (!publicRuntimeConfig.networkConfig.factoryAddress)
        console.error("Network Factory Contract is Missing");
      else {
        this.isNetworkFactoryStarted = false;

        this.networkFactory = new NetworkFactory(this.bepro,
          publicRuntimeConfig.networkConfig.factoryAddress);

        await this.networkFactory.loadContract();

        this.isNetworkFactoryStarted = true;

        this.operatorAmount = await this.getOperatorAmount();
      }
    } catch (error) {
      console.log("Failed to Start the Network Factory", error);
    }

    return this.isNetworkFactoryStarted;
  }

  async login() {
    if (!this.isStarted) return false;

    this.isLoggedIn = false;

    await this.bepro.connect();
    await this.start(this.network.contractAddress);

    this.address = await this.bepro.getAddress();
    this.isLoggedIn = true;

    return this.isLoggedIn;
  }

  async isTokenApproved(tokenAddress: string = undefined, amount: number): Promise<boolean> {
    try {
      const erc20 = await this.getERC20Obj(tokenAddress);

      return erc20.isApproved(this.network.contractAddress, amount);
    } catch (error) {
      console.log('Failed to get token approval: ', error);
      return false;
    }
  }

  async approveToken(tokenAddress: string = undefined, amount: number) {
    const erc20 = await this.getERC20Obj(tokenAddress);

    return erc20.approve(this.network.contractAddress, amount);
  }

  async isApprovedSettlerToken() {
    if (this.isStarted) {
      const settler = this.network.settlerToken;

      return settler.isApproved(this.network.contractAddress, 1);
    }

    return false;
  }

  async isNetworkAbleToClose(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    const totalSettlerLocked = await network.totalSettlerLocked();
    const closedBounties = await network.closedBounties();
    const canceledBounties = await network.canceledBounties();
    const bountiesTotal = await network.bountiesIndex();

    return (
      totalSettlerLocked === 0 &&
      closedBounties + canceledBounties === bountiesTotal
    );
  }

  async isCouncil(address = this.address) {
    if (this.isStarted) {
      const councilAmount = await this.getNetworkParameter("councilAmount");
      const oraclesOf = await this.getOraclesOf(address);

      return oraclesOf >= councilAmount;
    }

    return false;
  }

  async claimNetworkGovernor(networkAddress) {
    const network = new Network_v2(this.bepro, networkAddress);

    await network.loadContract();

    return network.sendTx(network.contract.methods.claimGovernor());
  }
  
  // TODO isApprovedTransactionalToken
  async isApprovedTransactionalToken(): Promise<boolean> {
    return false;
  }

  
  // TODO closeNetwork
  // TODO createNetwork



  // Getters and Setters
  async getNetworkParameter(parameter: "councilAmount" | 
    "disputableTime" | 
    "draftTime" | 
    "oracleExchangeRate" | 
    "mergeCreatorFeeShare" | 
    "percentageNeededForDispute") {
    if (this.isStarted) return this.network[parameter]();

    return 0;
  }

  async setNetworkParameter(parameter: "councilAmount" | 
  "disputableTime" | 
  "draftTime" | 
  "oracleExchangeRate" | 
  "mergeCreatorFeeShare" | 
  "percentageNeededForDispute", value: number) {
    if (!this.isStarted) return false;
    
    const param = [...parameter];
    param[0] = param[0].toUpperCase();

    return this.network[`change${param.join('')}`](value);
  }

  async getOraclesResume(): Promise<OraclesResume> {
    if (this.isStarted) return this.network.getOraclesResume(this.address);

    return {
      locked: 0,
      delegatedToOthers: 0,
      delegatedByOthers: 0,
      delegations: []
    };
  }

  async getAllowance(tokenAddress: string = SETTLER_ADDRESS, walletAddress: string = undefined) {
    const erc20 = await this.getERC20Obj(tokenAddress);

    return erc20.allowance(walletAddress || this.address, this.network.contractAddress);
  }

  async getOraclesOf(address: string) {
    if (this.isStarted) return this.network.getOraclesOf(address);

    return 0;
  }

  async getSettlerTokenName(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.settlerToken.name();
  }

  async getClosedBounties(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.closedBounties();
  }

  async getBounty(id: number): Promise<Bounty> {
    if (!this.isStarted) return;
    
    const bounty = await this.network.getBounty(id);
    const transactional = new ERC20(this.bepro, bounty.transactional);

    await transactional.loadContract();

    const network = await this.getNetworkObj();

    return bountyParser({
      ...bounty,
      tokenAmount: fromSmartContractDecimals(bounty.tokenAmount, transactional.decimals),
      proposals: bounty.proposals.map(proposal => ({
        ...proposal, 
        oracles: fromSmartContractDecimals(+proposal.oracles, network.settlerToken.decimals),
        disputeWeight: fromSmartContractDecimals(+proposal.disputeWeight, this.network.settlerToken.decimals)
      }))
    });
  }

  async getBounties(ids: number[] = []): Promise<Bounty[]> {
    if (!this.isStarted) return [];

    const bountiesCount =  await this.getBountiesCount();
    
    const idsToFind = ids.length ? ids : Array(bountiesCount).fill(1).map((value, index) => value + index);

    const bounties = await Promise.all(idsToFind.map(value => this.getBounty(value)));

    return bounties;
  }

  async getBountiesCount(networkAddress = undefined): Promise<number> {
    if (!this.isStarted) return 0;

    const network = await this.getNetworkObj(networkAddress);

    return network.bountiesIndex();
  }

  async getOpenBounties(networkAddress = undefined) {
    try {
      const network = await this.getNetworkObj(networkAddress);

      return Promise.all([
        network.bountiesIndex(),
        network.canceledBounties(),
        network.closedBounties()
      ]).then((values) => {
        return values[0] - values[1] - values[2];
      });
    } catch (error) {
      console.log("Failed to getOpenBounties", error);
    }

    return 0;
  }

  async getTotalSettlerLocked(networkAddress = undefined) {
    try {
      const network = await this.getNetworkObj(networkAddress);

      return network.totalSettlerLocked();
    } catch (error) {
      console.log("Failed to getTotalSettlerLocked", error);
    }

    return 0;
  }

  // TODO getOperatorAmount
  async getOperatorAmount() {
    if (this.isNetworkFactoryStarted)
      return this.networkFactory.OPERATOR_AMOUNT();

    return 0;
  }

  async getNetworkObj(networkAddress = undefined): Promise<Network_v2> {
    if (networkAddress) {
      const customNetwork = new Network_v2(this.bepro, networkAddress);

      await customNetwork.loadContract();

      return customNetwork;
    }

    return this.network;
  }

  async getERC20Obj(tokenAddress = undefined): Promise<ERC20> {
    if (!tokenAddress) return this.network.settlerToken;

    const erc20 = new ERC20(this.bepro, tokenAddress);

    await erc20.loadContract();

    return erc20;
  }

  async getBalance(kind: `eth` | `bepro` | `staked`): Promise<number> {
    try {
      let n = 0;

      switch (kind) {
      case 'bepro':
        n = await this.network.settlerToken.getTokenAmount(this.address);
        break;
      case 'eth':
        n = +this.bepro.Web3.utils.fromWei(await this.bepro.getBalance());
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

  async getTokenBalance(tokenAddress: string = undefined, walletAddress = this.address): Promise<number> {
    try {
      const erc20 = await this.getERC20Obj(tokenAddress);

      return erc20.getTokenAmount(walletAddress);
    } catch (error) {
      console.log('Failed to get token balance: ', error);
      return 0;
    }
  }

  // TODO getTokensStacked
  // TODO getNetworksQuantity
  // TODO getNetworkAdressByCreator
  // TODO getTokensLockedByAddress

  async calculateDistributedAmounts(bountyAmount: number, percentages: number[]) {
    const network = await this.getNetworkObj();

    return network.calculateDistributedAmounts(bountyAmount, percentages);
  }

  // Getters and Setters

  fromWei(wei: string) {
    return this.bepro.Web3.utils.fromWei(wei);
  }

  toWei(n: string | number) {
    return this.bepro.Web3.utils.toWei(n.toString(), `ether`);
  }

  async openBounty({
    cid,
    title,
    repoPath,
    branch,
    githubUser,
    transactional,
    rewardToken = nativeZeroAddress,
    tokenAmount = 0,
    rewardAmount = 0,
    fundingAmount = 0
  }) {
    if (!this.isStarted) return new Error("BeproService is not started.");

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
}

export const BeproService = new BeproFacet();

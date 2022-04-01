import { ERC20, Network, NetworkFactory, Web3Connection } from "@taikai/dappkit";
import getConfig from "next/config";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import {
  BlockTransaction,
  SimpleBlockTransactionPayload
} from "@interfaces/transaction";
import { Web3Connection, Network_v2, ERC20, NetworkFactory } from "bepro-js";


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
    try {
      this.isLoggedIn = false;

      await this.bepro.connect();
      await this.start(this.network.contractAddress);

      this.address = await this.bepro.getAddress();
      this.isLoggedIn = true;
    } catch (error) {
      console.log("Failed to login", error);
    }

    return this.isLoggedIn;
  }

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

  async isTokenApproved(tokenAddress: string = undefined): Promise<boolean> {
    try {
      const erc20 = await this.getERC20Obj(tokenAddress);

      return erc20.isApproved(this.network.contractAddress, 1);
    } catch (error) {
      console.log('Failed to get token approval: ', error);
      return false;
    }
  }

  async approveToken(tokenAddress: string = undefined) {
    const erc20 = await this.getERC20Obj(tokenAddress);

    return erc20.approve(this.network.contractAddress, await erc20.totalSupply());
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

    return bountyParser(bounty);
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

      await Promise.all([
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

  async getDraftTime() {
    if (this.isStarted) return this.network.draftTime();

    return 0;
  }

  async setDraftTime(time: number) {
    if (this.isStarted) return this.network.changeDraftTime(time);

    return false;
  }

  async getDisputableTime() {
    if (this.isStarted) return this.network.disputableTime();

    return 0;
  }

  async setDisputableTime(time: number) {
    if (this.isStarted) return this.network.changeDisputableTime(time);

    return false;
  }

  async isApprovedSettlerToken() {
    if (this.isStarted) {
      const settler = this.network.settlerToken;

      return settler.isApproved(settler.contractAddress, 1);
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
      const councilAmount = await this.getCouncilAmount();
      const oraclesOf = await this.getOraclesOf(address);

      return oraclesOf >= councilAmount;
    }

    return false;
  }

  async getOraclesOf(address: string) {
    if (this.isStarted) return this.network.getOraclesOf(address);

    return 0;
  }

  async getCouncilAmount() {
    if (this.isStarted) return this.network.councilAmount();

    return 0;
  }

  async setCouncilAmount(amount: number) {
    if (this.isStarted) return this.network.changeCouncilAmount(amount);

    return false;
  }

  async getPercentageNeededForDispute() {
    if (this.isStarted) return this.network.percentageNeededForDispute();

    return 0;
  }

  async setPercentageNeededForDispute(percentage: number) {
    if (this.isStarted)
      return this.network.changePercentageNeededForDispute(percentage);

    return 0;
  }

  async createNetwork() {
    return this.networkFactory.createNetwork(publicRuntimeConfig.contract.settler, publicRuntimeConfig.contract.settler);
  }

  async claimNetworkGovernor(networkAddress) {
    const network = new Network_v2(this.bepro, networkAddress);

    await network.loadContract();

    return network.sendTx(network.contract.methods.claimGovernor());
  }

  // TODO getOraclesSummary
  async getOraclesSummary() {
    //if (this.isStarted) return this.network.getOraclesSummary(this.address)

    return {
      oraclesDelegatedByOthers: 0,
      amounts: [],
      addresses: [],
      tokensLocked: 0,
      delegatedToOthers: 0
    };
  }
  
  // TODO isApprovedTransactionalToken
  async isApprovedTransactionalToken(): Promise<boolean> {
    return false;
  }

  // TODO getTokensStacked
  // TODO getTokensLockedByAddress
  // TODO closeNetwork
  // TODO getOperatorAmount
  // TODO createNetwork
  // TODO getNetworksQuantity
  // TODO getNetworkAdressByCreator

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
    rewardToken = undefined,
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

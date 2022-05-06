import { 
  Web3Connection, 
  Network_v2, 
  ERC20, 
  NetworkFactoryV2, 
  Bounty, 
  OraclesResume,
  Defaults
} from "@taikai/dappkit";
import getConfig from "next/config";

import { Token } from "interfaces/token";

import { NetworkParameters } from "types/dappkit";


const { publicRuntimeConfig } = getConfig();
class BeproFacet {
  readonly bepro: Web3Connection = new Web3Connection({
    web3Host: publicRuntimeConfig.web3ProviderConnection
  });

  network: Network_v2;
  networkFactory: NetworkFactoryV2;

  address: string;

  isStarted = false;
  isLoggedIn = false;
  isNetworkFactoryStarted = false;

  async start(networkAddress = publicRuntimeConfig.contract.address) {
    try {
      if (!this.isStarted) await this.bepro.start();
      
      this.network = new Network_v2(this.bepro, networkAddress);

      await this.network.loadContract();

      if (!this.isStarted)
        console.table({
          web3: publicRuntimeConfig.web3ProviderConnection,
          contract: networkAddress,
          settler: this.network.settlerToken?.contractAddress,
          nft: this.network.nftToken?.contractAddress,
          started: this.isStarted
        });

      this.isStarted = true;
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

        this.networkFactory = new NetworkFactoryV2(this.bepro,
          publicRuntimeConfig.networkConfig.factoryAddress);

        await this.networkFactory.loadContract();

        this.isNetworkFactoryStarted = true;
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
    const network = await this.getNetworkObj();
    const settler = network.settlerToken;

    return settler.isApproved(network.contractAddress, 1);
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
    const councilAmount = await this.getNetworkParameter("councilAmount");
    const oraclesOf = await this.getOraclesOf(address);

    return oraclesOf >= councilAmount;
  }

  async claimNetworkGovernor(networkAddress) {
    const network = await this.getNetworkObj(networkAddress);

    return network.sendTx(network.contract.methods.claimGovernor());
  }

  
  async closeNetwork() {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();
    
    return this.networkFactory.unlock()
  }

  async createNetwork(networkToken: string = publicRuntimeConfig.contract.settler, 
                      nftToken: string = publicRuntimeConfig.contract.nft, 
                      nftUri = '//',
                      treasuryAddress = Defaults.nativeZeroAddress,
                      cancelFee = 10000,
                      closeFee= 50000) {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();

    return this.networkFactory.createNetwork(networkToken, nftToken, nftUri, treasuryAddress, cancelFee, closeFee);
  }

  // Getters and Setters
  async getNetworkParameter(parameter: NetworkParameters) {
    const network = await this.getNetworkObj();

    return network[parameter]();
  }

  async setNetworkParameter(parameter: NetworkParameters, value: number) {
    const network = await this.getNetworkObj();
    
    const param = [...parameter];
    param[0] = param[0].toUpperCase();

    return network[`change${param.join('')}`](value);
  }

  async getOraclesResume(): Promise<OraclesResume> {
    if (!this.isLoggedIn) return {
      locked: 0,
      delegatedToOthers: 0,
      delegatedByOthers: 0,
      delegations: []
    };

    const network = await this.getNetworkObj();

    return network.getOraclesResume(this.address);
  }

  async getAllowance(tokenAddress: string = publicRuntimeConfig.contract.settler, 
                    walletAddress = this.address, 
                    spenderAddress = this.network.contractAddress) {
    const erc20 = await this.getERC20Obj(tokenAddress);

    return erc20.allowance(walletAddress, spenderAddress);
  }

  async getOraclesOf(address: string) {
    const network = await this.getNetworkObj();
    
    return network.getOraclesOf(address);
  }

  async getSettlerTokenData(networkAddress = undefined): Promise<Token> {
    const network = await this.getNetworkObj(networkAddress);

    return {
      name: await network.settlerToken.name(),
      symbol: await network.settlerToken.symbol(),
      address: network.settlerToken.contractAddress
    };
  }

  async getClosedBounties(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.closedBounties();
  }

  async getBounty(id: number): Promise<Bounty> {
    const network = await this.getNetworkObj();

    return network.getBounty(id);
  }

  async getBounties(ids: number[] = []): Promise<Bounty[]> {
    const bountiesCount =  await this.getBountiesCount();
    
    const idsToFind = ids.length ? ids : Array(bountiesCount).fill(1).map((value, index) => value + index);

    const bounties = await Promise.all(idsToFind.map(value => this.getBounty(value)));

    return bounties;
  }

  async getBountiesCount(networkAddress = undefined): Promise<number> {
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

  async getCreatorAmount(): Promise<number> {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();
      
    return this.networkFactory.creatorAmount();
  }

  async getNetworkObj(networkAddress = undefined): Promise<Network_v2> {
    if (networkAddress) {
      const customNetwork = new Network_v2(this.bepro, networkAddress);

      await customNetwork.loadContract();

      return customNetwork;
    }

    await this.start(this.network.contractAddress);

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
      const network = await this.getNetworkObj();

      let n = 0;

      switch (kind) {
      case 'bepro':
        n = await network.settlerToken.getTokenAmount(this.address);
        break;
      case 'eth':
        n = +this.bepro.Web3.utils.fromWei(await this.bepro.getBalance());
        break;
      case 'staked':
        n = await network.totalSettlerLocked();
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

  async getTokensLocked() {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();

    return this.networkFactory.tokensLocked();
  }

  async getNetworksQuantity() {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();

    return this.networkFactory.amountOfNetworks();
  }

  async getNetworkAdressByCreator(address: string) {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();

    return this.networkFactory.networkOfAddress(address);
  }

  async getTokensLockedByAddress(address: string) {
    if (!this.isNetworkFactoryStarted) await this.startNetworkFactory();

    return this.networkFactory.lockedTokensOfAddress(address);
  }

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
    rewardToken = Defaults.nativeZeroAddress,
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

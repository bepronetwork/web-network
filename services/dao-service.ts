import { 
  ERC20,
  Network_v2,
  OraclesResume,
  Web3Connection,
  NetworkFactoryV2
} from "@taikai/dappkit";
import getConfig from "next/config";

import { Token } from "interfaces/token";

import { NetworkParameters } from "types/dappkit";

const { publicRuntimeConfig } = getConfig();

export default class DAO {
  private _web3Connection: Web3Connection;
  private _network: Network_v2;
  private _factory: NetworkFactoryV2;

  get web3Connection() { return this._web3Connection; }
  get network() { return this._network; }
  get factory() { return this._factory; }

  constructor() {
    if (!publicRuntimeConfig?.web3ProviderConnection) 
      throw new Error("Missing web3ProviderConnection in next.config.js");

    this._web3Connection = new Web3Connection({
      web3Host: publicRuntimeConfig.web3ProviderConnection
    });
  }

  async loadNetwork(networkAddress: string = publicRuntimeConfig?.contract?.address, 
                    skipAssignment?: boolean): Promise<Network_v2 | boolean> {
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

  async loadFactory(skipAssignment?: boolean): Promise<NetworkFactoryV2 | boolean> {
    try {
      if (!publicRuntimeConfig?.networkConfig?.factoryAddress) 
        throw new Error("Missing NetworkFactoryV2 Contract Address");

      const factory = new NetworkFactoryV2(this.web3Connection, publicRuntimeConfig.networkConfig.factoryAddress);

      await factory.loadContract();

      if (!skipAssignment) this._factory = factory;

      return factory;
    } catch (error) {
      console.log("Error loading NetworkFactoryV2: ", error);
    }

    return false;
  }

  async loadERC20(tokenAddress): Promise<ERC20> {
    const erc20 = new ERC20(this.web3Connection, tokenAddress);

    await erc20.loadContract();

    return erc20;
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

  async getNetwork(networkAddress: string = undefined): Promise<Network_v2> {
    if (!networkAddress || networkAddress === publicRuntimeConfig?.contract?.address) return this._network;

    const network = await this.loadNetwork(networkAddress, true);

    return network;
  }

  async getBalance(kind: `eth` | `settler` | `staked`, address?: string): Promise<number> {
    try {
      const network = await this.getNetwork();

      let n = 0;

      switch (kind) {
      case 'settler':
        n = await network.settlerToken.getTokenAmount(address || await this.getAddress());
        break;
      case 'eth':
        n = +this.web3Connection.Web3.utils.fromWei(await this.web3Connection.getBalance());
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

  async getNetworkParameter(parameter: NetworkParameters): Promise<number> {
    const network = await this.getNetwork();

    return network[parameter]();
  }

  async getOraclesOf(address?: string): Promise<number> {
    const network = await this.getNetwork();
    
    return network.getOraclesOf(address || await this.getAddress());
  }

  async isCouncil(address?: string): Promise<boolean> {
    const councilAmount = await this.getNetworkParameter("councilAmount");
    const oraclesOf = await this.getOraclesOf(address || await this.getAddress());

    return oraclesOf >= councilAmount;
  }

  async getOraclesResume(address?: string): Promise<OraclesResume> {
    const network = await this.getNetwork();

    return network.getOraclesResume(address || await this.getAddress());
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

  async getTotalSettlerLocked(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.totalSettlerLocked();
  }

  async getNetworksQuantityInFactory(): Promise<number> {
    if (!this.factory) await this.loadFactory();

    return this.factory.amountOfNetworks();
  }

  async getTokensLockedInFactory(): Promise<number> {
    if (!this.factory) await this.loadFactory();

    return this.factory.tokensLocked();
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
}
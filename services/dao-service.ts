import { 
  Network_v2,
  OraclesResume,
  Web3Connection
} from "@taikai/dappkit";
import getConfig from "next/config";

import { NetworkParameters } from "types/dappkit";

const { publicRuntimeConfig } = getConfig();

export default class DAO {
  private _web3Connection: Web3Connection;
  private _network: Network_v2;

  get web3Connection() { return this._web3Connection; }
  get network() { return this._network; }

  constructor() {
    if (!publicRuntimeConfig?.web3ProviderConnection) 
      throw new Error("Missing web3ProviderConnection in next.config.js");

    this._web3Connection = new Web3Connection({
      web3Host: publicRuntimeConfig.web3ProviderConnection
    });
  }

  async loadNetwork(networkAddress: string = publicRuntimeConfig?.contract?.address, 
                    shouldReturn?: boolean): Promise<Network_v2 | boolean> {
    try {
      if (!networkAddress) throw new Error("Missing Network Contract Address");

      const network = new Network_v2(this.web3Connection, networkAddress);

      await network.loadContract();

      if (!shouldReturn) this._network = network;

      return network;
    } catch (error) {
      console.log("Error loading network: ", error);
    }

    return false;
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
    if (!networkAddress) return this._network;

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

    return network.openBounies();
  }

  async getTotalSettlerLocked(networkAddress?: string): Promise<number> {
    const network = await this.getNetwork(networkAddress);

    return network.totalSettlerLocked();
  }
}
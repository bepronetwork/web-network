import { Web3Connection, Network, ERC20, NetworkFactory } from "@taikai/dappkit";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import {
  BlockTransaction,
  SimpleBlockTransactionPayload
} from "interfaces/transaction";

import {
  CONTRACT_ADDRESS,
  SETTLER_ADDRESS,
  WEB3_CONNECTION,
  NETWORK_FACTORY_ADDRESS
} from "../env";

class BeproFacet {
  readonly bepro: Web3Connection = new Web3Connection({
    web3Host: WEB3_CONNECTION
    //privateKey: process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY,
    //debug: true
  });

  erc20: ERC20;
  network: Network;
  address = "";
  operatorAmount: number;
  started = false;
  connected = false;
  networkFactory: NetworkFactory;
  networkFactoryStarted = false;

  get isLoggedIn() {
    return this.connected;
  }

  get isStarted() {
    return this.started;
  }

  async start(customNetworkAddress = undefined) {
    try {
      if (!this.started) await this.bepro.start();

      this.network = new Network(this.bepro,
        customNetworkAddress || CONTRACT_ADDRESS);

      this.erc20 = new ERC20(this.bepro, SETTLER_ADDRESS);

      await this.network.loadContract();

      this.started = true;

      await this.erc20.loadContract();
    } catch (error) {
      console.log("Failed to start Bepro Service", error);

      this.started = false;
    }

    return this.started;
  }

  async startNetworkFactory() {
    try {
      if (!NETWORK_FACTORY_ADDRESS)
        console.error("Network Factory Contract is Missing");
      else {
        this.networkFactoryStarted = false;

        this.networkFactory = new NetworkFactory(this.bepro,
          NETWORK_FACTORY_ADDRESS);

        await this.networkFactory.loadContract();

        this.networkFactoryStarted = true;

        this.operatorAmount = await this.getOperatorAmount();
      }
    } catch (error) {
      console.error(error);
    }

    return this.networkFactoryStarted;
  }

  async login() {
    this.connected = false;
    await this.bepro.connect();
    await this.start(this.network.contractAddress);
    this.address = await this.bepro.getAddress();
    this.connected = true;
  }

  async getBalance(kind: "eth" | "bepro" | "staked"): Promise<number> {
    if (!this.connected || !this.started) return 0;

    let n = 0;
    if (kind === "bepro") n = await this.erc20.getTokenAmount(this.address);
    if (kind === "eth")
      n = +this.bepro.Web3.utils.fromWei(await this.bepro.getBalance());
    if (kind === "staked") n = await this.network.getBEPROStaked();

    return n;
  }

  async getNetworkObj(networkAddress = undefined) {
    if (networkAddress) {
      const customNetwork = new Network(this.bepro, networkAddress);

      await customNetwork.loadContract();

      return customNetwork;
    }

    return this.network;
  }

  async getClosedIssues(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.getAmountOfIssuesClosed();
  }

  async getSettlerTokenName(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.settlerToken.name();
  }

  async getTransactionalTokenName(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.transactionToken.name();
  }

  async getOpenIssues(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    const quantity = await network.getAmountOfIssuesOpened();

    return quantity - 1;
  }

  async getBeproLocked(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.getBEPROStaked();
  }

  async getTokensStaked(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    return network.getTokensStaked();
  }

  async getRedeemTime() {
    if (this.isStarted) return this.network.redeemTime();

    return 0;
  }

  async setRedeemTime(time: number) {
    if (this.isStarted) return this.network.changeRedeemTime(time);

    return false;
  }

  async getDisputableTime() {
    if (this.isStarted) return this.network.disputableTime();

    return 0;
  }

  async setDisputeTime(time: number) {
    if (this.isStarted) return this.network.changeDisputableTime(time);

    return false;
  }

  async getOraclesSummary() {
    if (this.isStarted) return this.network.getOraclesSummary(this.address);

    return {
      oraclesDelegatedByOthers: 0,
      amounts: [],
      addresses: [],
      tokensLocked: 0,
      delegatedToOthers: 0
    };
  }

  async isApprovedTransactionalToken() {
    if (this.isStarted) return this.network.isApprovedTransactionalToken(1);

    return false;
  }

  async isApprovedSettlerToken() {
    if (this.isStarted) return this.network.isApprovedSettlerToken(1);

    return false;
  }

  async isNetworkAbleToClose(networkAddress = undefined) {
    const network = await this.getNetworkObj(networkAddress);

    const tokensStaked = await network.getTokensStaked();
    const beproLocked = await network.getBEPROStaked();

    return tokensStaked === 0 && beproLocked === 0;
  }

  async getTokensLockedByAddress(address: string) {
    const amount = await this.networkFactory.getLockedStakedByAddress(address);

    return this.fromWei(`${amount}`);
  }

  async closeNetwork() {
    return this.networkFactory.unlock();
  }

  async getOperatorAmount() {
    if (this.networkFactoryStarted)
      return this.networkFactory.OPERATOR_AMOUNT();

    return 0;
  }

  async getCouncilAmount() {
    if (this.isStarted) return this.network.COUNCIL_AMOUNT();

    return 0;
  }

  async setCouncilAmount(amount: number) {
    if (this.isStarted) return this.network.changeCouncilAmount(`${amount}`);

    return false;
  }

  async getPercentageNeededForDispute() {
    if (this.isStarted) return this.network.percentageNeededForDispute();

    return 0;
  }

  async setPercentageForDispute(percentage: number) {
    if (this.isStarted)
      return this.network.sendTx(this.network.contract.methods.changePercentageNeededForDispute(percentage));

    return 0;
  }

  async createNetwork() {
    return this.networkFactory.createNetwork(SETTLER_ADDRESS, SETTLER_ADDRESS);
  }

  async claimNetworkGovernor(networkAddress) {
    const network = new Network(this.bepro, networkAddress);

    await network.loadContract();

    return network.sendTx(network.contract.methods.claimGovernor());
  }

  async getNetworksQuantity() {
    if (this.networkFactoryStarted)
      return this.networkFactory.callTx(this.networkFactory.contract.methods.networksAmount());

    return 0;
  }

  getNetworkAdressByCreator(creatorAddress: string) {
    return this.networkFactory.getNetworkByAddress(creatorAddress);
  }

  fromWei(wei: string) {
    return this.bepro.Web3.utils.fromWei(wei);
  }

  toWei(n: string | number) {
    return this.bepro.Web3.utils.toWei(n.toString(), "ether");
  }

  public parseTransaction(transaction,
    simpleTx?: SimpleBlockTransactionPayload) {
    return {
      ...simpleTx,
      addressFrom: transaction.from,
      addressTo: transaction.to,
      transactionHash: transaction.transactionHash,
      blockHash: transaction.blockHash,
      confirmations: (simpleTx as BlockTransaction)?.confirmations,
      status: transaction.status
        ? TransactionStatus.completed
        : TransactionStatus.failed
    };
  }
}

export const BeproService = new BeproFacet();

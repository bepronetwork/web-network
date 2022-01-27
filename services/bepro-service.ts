import {Web3Connection, Network, ERC20, NetworkFactory} from 'bepro-js/dist';
import {CONTRACT_ADDRESS, SETTLER_ADDRESS, WEB3_CONNECTION, NETWORK_FACTORY_ADDRESS} from '../env';
import {BlockTransaction, SimpleBlockTransactionPayload} from '@interfaces/transaction';
import {TransactionStatus} from '@interfaces/enums/transaction-status';

class BeproFacet {

  readonly bepro: Web3Connection = new Web3Connection({web3Host: WEB3_CONNECTION, privateKey: process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY});

  address: string = ``;
  connected: boolean = false;
  network: Network;
  networkFactory: NetworkFactory;
  erc20: ERC20;
  operatorAmount: number;

  get isLoggedIn() {
    return this.connected;
  }

  async start() {
    try {
      await this.bepro.start();
      this.network = new Network(this.bepro, CONTRACT_ADDRESS);
      this.erc20 = new ERC20(this.bepro, SETTLER_ADDRESS);
      this.networkFactory = new NetworkFactory(this.bepro, NETWORK_FACTORY_ADDRESS);
      
      await this.network.loadContract();
      await this.erc20.loadContract();
      await this.networkFactory.loadContract();

      this.operatorAmount = await this.getOperatorAmount();
    } catch (error) {
      console.log(`Failed to start Bepro Service`, error)

      return false
    }

    return true
  }

  async login() {
    this.connected = false;
    await this.bepro.connect();
    this.address = await this.bepro.getAddress();
    this.connected = true;
  }

  async getBalance(kind: `eth`|`bepro`|`staked`): Promise<number> {
    if (!this.connected)
      return 0;

    let n = 0;
    if (kind === `bepro`)
      n = await this.erc20.getTokenAmount(this.address);
    if (kind === `eth`)
      n = +this.bepro.Web3.utils.fromWei(await this.bepro.getBalance());
    if (kind === `staked`)
      n = await this.network.getBEPROStaked();

    return n;
  }

  async getClosedIssues() {
    return this.network.getAmountOfIssuesClosed();
  }

  async getOpenIssues() {
    return this.network.getAmountOfIssuesOpened();
  }

  async getTokensStaked() {
    return this.network.getTokensStaked();
  }

  async getRedeemTime() {
    return this.network.redeemTime();
  }

  async getDisputableTime() {
    return this.network.disputableTime();
  }

  async getOraclesSummary() {
    return this.network.getOraclesSummary(this.address);
  }

  async isApprovedTransactionalToken() {
    return this.network.isApprovedTransactionalToken(1, this.address);
  }

  async isApprovedSettlerToken() {
    return this.network.isApprovedSettlerToken(1, this.address);
  }

  async getTokensLockedByAddress(address: string) {
    const amount = await this.networkFactory.getLockedStakedByAddress(address)

    return this.fromWei(`${amount}`)
  }

  async getOperatorAmount() {
    return this.networkFactory.OPERATOR_AMOUNT()
  }

  fromWei(wei: string) {
    return this.bepro.Web3.utils.fromWei(wei)
  }

  toWei(n: string|number) {
    return this.bepro.Web3.utils.toWei(n.toString(), `ether`);
  }

  public parseTransaction(transaction, simpleTx?: SimpleBlockTransactionPayload) {
    return {
      ...simpleTx,
      addressFrom: (transaction).from,
      addressTo: (transaction).to,
      transactionHash: (transaction).transactionHash,
      blockHash: (transaction).blockHash,
      confirmations: (simpleTx as BlockTransaction)?.confirmations,
      status: (transaction).status ? TransactionStatus.completed : TransactionStatus.failed,
    }
  }

}

export const BeproService = new BeproFacet();
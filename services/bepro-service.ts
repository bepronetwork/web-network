import {Application, ERC20Contract, Network} from 'bepro-js';
import {BlockTransaction, SimpleBlockTransactionPayload} from '@interfaces/transaction';
import {CONTRACT_ADDRESS, SETTLER_ADDRESS, TRANSACTION_ADDRESS, WEB3_CONNECTION} from '../env';
import {TransactionStatus} from '@interfaces/enums/transaction-status';

class BeproFacet {
  private _bepro: Application;
  public get bepro(): Application { return this._bepro }

  private _network: Network;
  public get network(): Application { return this._network }

  private _ERC20: ERC20Contract
  public get ERC20(): Application { return this._ERC20 }

  private _loggedIn = false;
  get isLoggedIn(): boolean { return this._loggedIn; }

  private _address = ``;
  get address(): string { return this._address; }

  constructor(
      public readonly web3Connection = WEB3_CONNECTION,
      public readonly contractAddress = CONTRACT_ADDRESS,
      public readonly settlerAddress = SETTLER_ADDRESS,
      public readonly transactionAddress = TRANSACTION_ADDRESS, ) {

    console.table({web3: WEB3_CONNECTION, contract: CONTRACT_ADDRESS, settler: SETTLER_ADDRESS, transaction: TRANSACTION_ADDRESS})

    const opt = {opt: {web3Connection}};
    this._bepro = new Application(opt);
    this._network = new Network({contractAddress, ...opt});
    this._ERC20 = new ERC20Contract({contractAddress: settlerAddress, ...opt});
  }

  public async login(force?: boolean): Promise<boolean> {
    if (!force && this._loggedIn) return true;

    if (force) {
      const opt = {opt: {web3Connection: this.web3Connection}};
      this._bepro = new Application(opt);
      this._network = new Network({contractAddress: this.contractAddress, ...opt});
      this._ERC20 = new ERC20Contract({contractAddress: this.settlerAddress, ...opt});
    }

    let success = false;

    try {

      success = ![
        await this.bepro.login(),
        await this.network.login(),
        await this.ERC20.login(),
      ].some(bool => !bool);

      if (success) {
        await this.network.__assert();
        await this.ERC20.__assert();
        this._address = await this.bepro.getAddress();
      }

    } catch (e) {
      success = false;
      console.error(`Error logging in,`, e);
    }

    return this._loggedIn = success;
  }

  public async getBalance(kind: `eth`|`bepro`|`staked`) {
    if (!this.isLoggedIn)
      return 0;

    if (kind === 'bepro')
      return this.ERC20.getTokenAmount(this.address);
    if (kind === 'eth')
      return this.bepro.web3.utils.fromWei((await this.bepro.web3.eth.getBalance(this.address)), `ether`);
    if (kind === 'staked')
      return this.network.getBEPROStaked();

    throw new Error(`Wrong kind, must be eth|bepro|staked`);
  }

  public async getAddress() {
    return await this._bepro.getAddress();
  }

  public async parseTransaction(transaction, simpleTx?: SimpleBlockTransactionPayload) {
    const result = await this._bepro.web3.eth.getTransaction(transaction.transactionHash).catch(_ => null);

    return {
      ...simpleTx,
      addressFrom: transaction.from,
      addressTo: transaction.to,
      transactionHash: transaction.transactionHash,
      blockHash: transaction.blockHash,
      confirmations: result?.nonce,
      status: result && transaction.status ? TransactionStatus.completed : TransactionStatus.failed,
    }
  }
}

// todo: complete this beast
export const BeproService = new BeproFacet();

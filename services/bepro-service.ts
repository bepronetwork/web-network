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

  public async start() {
    // this._bepro.test = true;
    this._network.test = true;
    this._ERC20.test = true;

    try {
      await this._network.start();
      await this._ERC20.start();
    } catch (e) {
      console.log(`Failed to start`, e);
      return false;
    }

    return true;
  }

  public async startInApi() {
    // this._bepro.test = true;

    const opt: {opt: {web3Connection: string}, privateKey?: string} = {opt: {web3Connection: this.web3Connection}};
    opt.privateKey = process.env.NEXT_PRIVATE_KEY

    console.log('i am here ->',opt )
    //this._bepro = new Application(opt);
    this._network = new Network({contractAddress: this.contractAddress, ...opt});
    this._network.test = true;

    try {
      await this._network.start();
    } catch (e) {
      console.log(`Failed to start`, e);
      return false;
    }

    return true;
  }



  public async login(force?: boolean, key?: boolean): Promise<boolean> {
    if (!force && this._loggedIn) return true;

    if (force || this._network.test) {
      const opt: {opt: {web3Connection: string}, privateKey?: string} = {opt: {web3Connection: this.web3Connection}};
      if(key) opt.privateKey = process.env.NEXT_PRIVATE_KEY

      console.log('i am here ->',opt )
      this._bepro = new Application(opt);
      this._network = new Network({contractAddress: this.contractAddress, useLastBlockGasPriceWhenMetaSend: 10000000000, ...opt});
      this._ERC20 = new ERC20Contract({contractAddress: this.settlerAddress, useLastBlockGasPriceWhenMetaSend: 10000000000, ...opt});
    }

    let success = false;

    try {
      const bepro = await this.bepro.login();
      const network = await this.network.login();
      const erc20 = await this.ERC20.login();

      success = ![bepro, network, erc20].some(bool => !bool);
      console.log('sucesso try catch', success,bepro,network,erc20 )
      if (success) {
        await this.ERC20.__assert();
        await this.network.__assert();

        this._address = await this.bepro.getAddress();
      }

    } catch (e) {
      success = false;
      console.log('error', e)
      console.error(`Error logging in,`, e);
    }

    return this._loggedIn = success;
  }

  public async getBalance(kind: `eth`|`bepro`|`staked`) {
    if (!this.isLoggedIn)
      return 0;

    if (kind === 'bepro')
      return this.fromWei((await this.ERC20.getContract().methods.balanceOf(this.address).call()))
    if (kind === 'eth')
      return this.fromWei((await this.bepro.web3.eth.getBalance(this.address)));
    if (kind === 'staked')
      return this.network.getBEPROStaked();

    throw new Error(`Wrong kind, must be eth|bepro|staked`);
  }

  public async getAddress() {
    return await this._bepro.getAddress();
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

  async getClosedIssues() {
    return this._network.getAmountofIssuesClosed()
               .catch(e => {
                 console.log(`Error while getClosedIssued`, e)
                 return 0;
               });
  }

  async getOpenIssues() {
    return this._network.getAmountofIssuesOpened()
                       .catch(e => {
                         console.log(`Error while getOpenIssues`, e)
                         return 0;
                       });
  }

  async getBEPROStaked() {
    return this._network.getBEPROStaked()
                       .catch(e => {
                         console.log(`Error while getBEPROStaked`, e)
                         return 0;
                       });
  }

  async getTokensStaked() {
    return this._network.getTokensStaked()
                       .catch(e => {
                         console.log(`Error while getBEPROStaked`, e)
                         return 0;
                       });
  }

  async getRedeemTime() {
    return this._network.params.contract.getContract().methods.redeemTime().call()
  }

  async getOraclesSummary() {
    const summary = await this.network.params.contract.getContract().methods.getOraclesSummary(this.address).call()

    return {
      oraclesDelegatedByOthers: this.fromWei(summary[0]),
      amounts: summary[1] ? summary[1].map(a => this.fromWei(a)) : [],
      addresses: summary[2] ? summary[2].map(a => a) : [],
      tokensLocked: this.fromWei(summary[3]),
    }
  }

  async isApprovedTransactionalToken() {
    return this.network.isApprovedTransactionalToken({address: this.address, amount: 1})
  }

  async isApprovedSettlerToken() {
    return this.network.isApprovedSettlerToken({address: this.address, amount: 1})
  }

  fromWei(wei: string) {
    return this.bepro.web3.utils.fromWei(wei, 'ether')
  }

  toWei(number: string | number) {
    return this.bepro.web3.utils.toWei(number.toString(), 'ether')
  }

}

// todo: complete this beast
export const BeproService = new BeproFacet();

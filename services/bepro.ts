import { Application, Network } from 'bepro-js';

export default class BeproService {

  public static web3Connection = 'https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b';

  // bepro app
  public static bepro: any;

  // network app
  public static network: any;

  // smart contract bepro instance
  public static contract: any;

  // indicates if user has already done a successful metamask login
  public static loggedIn: boolean = false;

  // user eth address
  public static address: string = '';

  public static async init() {
    this.bepro = new Application({
      opt: {
        web3Connection: this.web3Connection,
      }
    });
    this.bepro.start();
    this.network = new Network({
      contractAddress: '0x852D6375c55498B326Fb87C69E16F010d2906C0E',
      opt: {
        web3Connection: this.web3Connection,
      }
    });
    await this.network.start();
  }

  public static async isLoggedIn() {
    return !!(await this.bepro.getAddress());
  }

  public static async login() {
    if (this.loggedIn) return true;

    try {
      this.loggedIn = await this.bepro.login();
      await this.network.login();
      // successful login
      if (this.loggedIn) {
        this.address = await this.getAddress();
      }
    } catch (e) {
      // should be non-blocking
      return false;
    }

    return this.loggedIn;
  }

  public static async getAddress(): Promise<string> {
    if (this.address) return this.address;

    return this.bepro.getAddress() || '';
  }
}

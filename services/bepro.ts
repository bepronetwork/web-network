import {Application} from 'bepro-js';

export default class BeproService {

  public web3Connection = 'https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b';

  // bepro app
  public bepro: any;

  // smart contract bepro instance
  public contract: any;

  // indicates if user has already done a successful metamask login
  public loggedIn: boolean = false;

  // user eth address
  public address: string = '';

  constructor() {
    this.bepro = new Application({
      test: false,
      opt: {
        web3Connection: this.web3Connection,
      }
    });
  }
}

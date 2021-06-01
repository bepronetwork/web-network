// import {Application} from 'bepro-js';
// const beprojs = require('bepro-js');
export default class BeproService {
  // bepro app
  public bepro: any;

  // smart contract bepro instance
  public contract: any;

  // indicates if user has already done a successful metamask login
  public loggedIn: boolean = false;

  // user eth address
  public address: string = '';

  constructor() {
    // this.bepro = new beprojs.Application({ test: true });
  }
}

import {Application, Network} from 'bepro-js';

class BeproFacet {
  private _bepro: any;
  private _network: any;

  private _loggedIn = false;
  get isLoggedIn(): boolean { return this._loggedIn; }

  private _address = ``;
  get address(): string { return this._address; }

  constructor(
      public readonly web3Connection = `https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b`,
      public readonly contractAddress = `0x0CCb54d3b4248FE833aCaB4E8993Bc720737F4B3`,) {

    const opt = {opt: {web3Connection}};
    this._bepro = new Application(opt);
    this._network = new Network({contractAddress, opt});

  }

  public async login(): Promise<boolean> {
    if (this._loggedIn) return true;
    let success = false;

    try {
      success = ![await this._bepro.login(), await this._network.login()].some(bool => !bool);
      if (success) {
        await this._network.__assert();
        this._address = await this._bepro.getAddress();
      }

    } catch (e) {
      console.log(`Error logging in,`, e);
    }

    return this._loggedIn = success;
  }
}

// todo: complete this beast
export const BeproService = new BeproFacet();

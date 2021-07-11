import BeproService from '../services/bepro';
import React, {useContext,} from 'react';
import {ApplicationContext} from '../contexts/application';
import {changeWalletState} from '../contexts/reducers/change-wallet-connect';

export default function ConnectWalletButton({children, onSuccess = () => null, onFail = () => console.log("error")}) {
  const { state: {metaMaskWallet}, dispatch } = useContext(ApplicationContext);

  async function connectWallet() {

    const loggedIn = await BeproService.login();
    await BeproService.getAddress();

    if (!loggedIn)
      onFail()
    else onSuccess();

    dispatch(changeWalletState(loggedIn))
  }

  if (!metaMaskWallet)
    return <button className="btn btn-md btn-white" onClick={connectWallet}>Connect <i className="ico-metamask ml-1"></i></button>;

  return children;

}

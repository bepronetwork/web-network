import BeproService from '../services/bepro';
import React, {useContext, useEffect, useState,} from 'react';
import {ApplicationContext} from '../contexts/application';
import {changeWalletState} from '../contexts/reducers/change-wallet-connect';

export default function ConnectWalletButton({children, forceLogin = false, onSuccess = () => null, onFail = () => console.log("error")}) {
  const { state: {metaMaskWallet, beproInit}, dispatch } = useContext(ApplicationContext);

  async function connectWallet() {

    const loggedIn = await BeproService.login();
    await BeproService.getAddress();

    if (!loggedIn)
      onFail()
    else onSuccess();

    dispatch(changeWalletState(loggedIn))
  }

  useEffect(() => {
    console.log(`beproInit?`, beproInit);
    if (!beproInit)
      return;

    let action: () => Promise<boolean|string>;

    if (forceLogin)
      action = BeproService.login;
    else action = () => Promise.resolve(BeproService.address);

    action().then((state: string|boolean) => dispatch(changeWalletState(!!state)))
            .catch(e => {
              console.log(`Error`, e);
            });

  }, [beproInit]);

  if (!metaMaskWallet)
    return <button className="btn btn-md btn-white" onClick={connectWallet}>Connect <i className="ico-metamask ml-1"></i></button>;

  return children;

}

import {BeproService} from '@services/bepro-service';
import React, {useContext, useEffect,} from 'react';
import {ApplicationContext} from '@contexts/application';
import {changeWalletState} from '@reducers/change-wallet-connect';
import {changeCurrentAddress} from '@reducers/change-current-address';
import {changeNetwork} from '@reducers/change-network';
import Modal from '@components/modal';
import Image from 'next/image';
import metamaskLogo from '@assets/metamask.png';
import ArrowRight from '@assets/icons/arrow-right';

export default function ConnectWalletButton({children = null, forceLogin = false, onSuccess = () => null, onFail = () => console.log("error"), asModal = false, btnColor = `white`}) {
  const { state: {metaMaskWallet, beproInit, currentAddress}, dispatch } = useContext(ApplicationContext);

  async function connectWallet() {
    let loggedIn = false;
    
    if(window.ethereum.networkVersion){
      dispatch(changeNetwork(window.ethereum.networkVersion));
    }

    try {
      loggedIn = await BeproService.login();
    } catch (e) {
      console.log(e);
    }

    if (!loggedIn)
      onFail()
    else onSuccess();

    dispatch(changeWalletState(loggedIn))
    dispatch(changeCurrentAddress(BeproService.address));
  }

  useEffect(() => {
    if (!beproInit)
      return;

    let action: () => Promise<boolean|string>;

    if (forceLogin)
      action = BeproService.login;
    else action = () => Promise.resolve(BeproService.address);

    action().then((state: string|boolean) =>
                    dispatch(changeWalletState(!!state)))
            .catch(e => {
              console.error(`Error changing wallet state`, e);
            });

  }, [beproInit]);

  if (asModal)
    return (
      <Modal 
      title="Connect your MetaMask Wallet" 
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={!currentAddress || !metaMaskWallet}>
        <div className="text-center">
        <strong className="smallCaption d-block text-uppercase text-white-50 mb-3 pb-1">
          to access this page please, connect to the <br/><span className="text-purple">kovan test network</span> on your metamask wallet
        </strong>
          <div className="d-flex justify-content-center align-items-center w-100">
              <div className="rounded-3 bg-dark-gray text-white p-3 d-flex text-center justify-content-center align-items-center w-75 cursor-pointer" onClick={connectWallet}>
                  <Image src={metamaskLogo} width={15} height={15}/>
                  <span className="fw-bold text-white text-uppercase ms-2">metamask</span>
              </div>
        </div>
        <div className="smallInfo text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-2 pt-1">
        by connecting, you accept{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none"
          >
            Terms & Conditions
          </a>{" "}
          <br /> and{" "}
          <a
            href="https://www.bepro.network/private-policy"
            target="_blank"
            className="text-decoration-none"
          >
            PRIVACY POLICY
          </a>
        </div>
      </div>
      </Modal>
    )

  if (!metaMaskWallet)
    return <button className={`btn btn-md btn-${btnColor}`} onClick={connectWallet}>Connect <i className="ico-metamask ml-1" /></button>;

  return children;

}

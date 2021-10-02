import Modal from '@components/modal';
import React, {useContext} from 'react';
import Image from 'next/image';
import {signIn} from 'next-auth/react';
import metamaskLogo from '@assets/metamask.png';
import {ApplicationContext} from '@contexts/application';
import {truncateAddress} from '@helpers/truncate-address';
import CheckMarkIcon from '@assets/icons/checkmark-icon';
import ErrorMarkIcon from '@assets/icons/errormark-icon';

export default function WrongNetworkModal({requiredNetwork = ``}) {

  const {state: {currentAddress, network: activeNetwork}} = useContext(ApplicationContext);

  function showModal() {
    return activeNetwork && requiredNetwork && activeNetwork !== requiredNetwork;
  }

  function getColor() {
    if (!activeNetwork || !requiredNetwork)
      return `primary`

    if (activeNetwork === requiredNetwork)
      return `success`

    return `danger`
  }


  function getColumnClass() {
    const color = getColor();

    return `col-6 rounded border border-${color} text-${color} p-3 d-flex justify-content-between align-items-center`;
  }

  return (
    <Modal
      title="Connect your MetaMask Wallet"
      titlePosition="center"
      titleClass="h4 text-white bg-opacity-100"
      show={showModal()}
    >
      <div className="text-center">
        <strong className="smallCaption d-block text-uppercase text-white-50 mb-4">
          to access this page please, connect to the{" "}
          <span className="text-purple">kovan test network</span> on your
          metamask wallet
        </strong>
        <div className="row">
          <div className="col-12 d-flex justify-content-center">
            {currentAddress ? (
              <div className={getColumnClass()}>
                <div className="d-flex justify-content-start align-items-center">
                  <Image src={metamaskLogo} width={15} height={15} />{" "}
                  <span className="ms-2">
                    {truncateAddress(currentAddress)}
                  </span>
                </div>
                {!showModal() ? <CheckMarkIcon /> : <ErrorMarkIcon />}
              </div>
            ) : (
              <div className="button-connect border bg-dark border-dark rounded d-flex justify-content-between p-3 align-items-center w-75">
                <div className="mx-auto d-flex align-items-center text-uppercase smallCaption">
                  <Image src={metamaskLogo} width={15} height={15} />{" "}
                  <span className="ms-2 text-white text-opacity-1">
                    metamask
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="smallInfo text-ligth-gray text-center fs-smallest text-dark text-uppercase mt-4">
        BY CONNECTING, YOU ACCEPT{" "}
          <a
            href="https://www.bepro.network/terms-and-conditions"
            target="_blank"
            className="text-decoration-none"
          >
            Terms & Conditions
          </a>{" "}
          <br />&{" "}
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
  );
}

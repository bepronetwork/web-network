import React from 'react';
import OraclesActions from '@components/oracles-actions';
import OraclesDelegate from '@components/oracles-delegate';
import OraclesTakeBack from '@components/oracles-take-back';
import Account from '@components/account';
import ConnectWalletButton from '@components/connect-wallet-button';
import OpenIcon from '@assets/icons/open-icon';

export default function MyOracles() {

  function navigateOut(href) {
    window.open(href);
  }

  return (
    <Account buttonPrimaryActive={false}>

      <div className="container">
        <div className="row justify-content-center mb-5 align-content-stretch">

          <OraclesActions />
          <OraclesDelegate />
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <OraclesTakeBack />
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <ConnectWalletButton asModal={true} />
          <div className="col-md-10">
            <div className="content-wrapper mb-5 cursor-pointer shadow-lg-hover" onClick={() => navigateOut('https://docs.bepro.network/getting-started/the-network')}>
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex align-items-flex-start">
                    <h4 className="h4">How to use Oracles?</h4>
                    <OpenIcon className="ml-1"/>
                  </div>
                  <p>
                    Oracles can be used on Council to vote and approve issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Account>
  );
}

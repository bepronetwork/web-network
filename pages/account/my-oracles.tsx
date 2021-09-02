import React from 'react';
import OraclesActions from '@components/oracles-actions';
import OraclesDelegate from '@components/oracles-delegate';
import OraclesTakeBack from '@components/oracles-take-back';
import Account from '@components/account';
import ConnectWalletButton from '@components/connect-wallet-button';

export default function MyOracles() {
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
            <div className="content-wrapper mb-5">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="h4">How to use Oracles?</h4>
                  <p>
                    Oracles can be used on Council to vote and approve issues
                  </p>
                </div>
                <div className="col-md-6">
                  <h4 className="h4">Why use Oracles?</h4>
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

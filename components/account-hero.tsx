import {useContext, useEffect, useState} from 'react';
import BeproService from "services/bepro";
import {changeLoadState} from '../contexts/reducers/change-load-state';
import {ApplicationContext} from '../contexts/application';
import {changeMyIssuesState} from '../contexts/reducers/change-my-issues';
import {changeOraclesState} from '../contexts/reducers/change-oracles';
import GithubHandle from './github-handle';

export default function AccountHero() {
  const {dispatch, state: {beproInit, oracles, metaMaskWallet}} = useContext(ApplicationContext);

  const [myIssueCount, setMyIssueCount] = useState<number>()

  function loadBeproNetworkInformation() {
    if (!beproInit || !metaMaskWallet)
      return;
    const address = BeproService.address;

    dispatch(changeLoadState(true));

    BeproService.network
                .getIssuesByAddress(address)
                .then(issuesList => {
                  setMyIssueCount(issuesList.length);
                  dispatch(changeMyIssuesState(issuesList));
                })
                .then(_ => BeproService.network.getOraclesSummary({address}))
                .then(oracles => dispatch(changeOraclesState(oracles)))
                .catch(e => {
                  console.error(e);
                })
                .finally(() => dispatch(changeLoadState(false)))

  }

  useEffect(loadBeproNetworkInformation, [beproInit, metaMaskWallet])

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between">
                <h1 className="h1 mb-0">My account</h1>
                <GithubHandle />
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{myIssueCount}</h4>
                    <span className="p-small">Issues</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{oracles.tokensLocked}</h4>
                    <span className="p-small">Oracles</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {oracles.oraclesDelegatedByOthers}
                    </h4>
                    <span className="p-small">Delegated oracles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {useContext, useEffect, useState} from 'react';
import {BeproService} from "@services/bepro-service";
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';
import {changeMyIssuesState} from '@reducers/change-my-issues';
import {changeOraclesParse, changeOraclesState} from '@reducers/change-oracles';
import GithubHandle from './github-handle';
import {formatNumberToCurrency} from '@helpers/formatNumber';
import {toastPrimary} from '@reducers/add-toast';
import { useTranslation } from 'next-i18next';

export default function AccountHero() {
  const {dispatch, state: {beproInit, oracles, metaMaskWallet, currentAddress, balance, myIssues}} = useContext(ApplicationContext);
  const { t } = useTranslation(['common', 'bounty']) 

  function loadBeproNetworkInformation() {
    if (!beproInit || !metaMaskWallet || !currentAddress)
      return;

    const address = currentAddress;

    BeproService.network
                .getIssuesByAddress(address)
                .then(issuesList => {
                  dispatch(changeMyIssuesState(issuesList));
                })
                .then(_ => BeproService.network.getOraclesSummary(address))
                .then(oracles => {
                  dispatch(changeOraclesState(changeOraclesParse(address, oracles)));
                })
                .catch(e => {
                  console.error(e);
                })
  }

  useEffect(loadBeproNetworkInformation, [beproInit, metaMaskWallet, currentAddress])

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <div className="d-flex justify-content-between">
                <h1 className="h2 mb-0">{t('heroes.my-account')}</h1>
                <GithubHandle />
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{formatNumberToCurrency(myIssues.length || 0)}</h4>
                    <span className="caption-small">{t('bounty:label_other')}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">{formatNumberToCurrency(+oracles?.tokensLocked + +oracles?.oraclesDelegatedByOthers || 0)}</h4>
                    <span className="caption-small">{t('$oracles')}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(oracles?.delegatedToOthers || 0)}
                    </h4>
                    <span className="caption-small">{t('heroes.delegated-oracles')}</span>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="top-border">
                    <h4 className="h4 mb-0">
                      {formatNumberToCurrency(+oracles?.oraclesDelegatedByOthers || 0)}
                    </h4>
                    <span className="caption-small">{t('heroes.delegated-by-others')}</span>
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

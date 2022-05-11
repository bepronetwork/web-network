import React from 'react';
import OraclesActions from '@components/oracles-actions';
import OraclesDelegate from '@components/oracles-delegate';
import OraclesTakeBack from '@components/oracles-take-back';
import Account from '@components/account';
import ConnectWalletButton from '@components/connect-wallet-button';
import ExternalLinkIcon from '@assets/icons/external-link-icon';
import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function MyOracles() {
  const { t } = useTranslation(['common', 'my-oracles'])

  function navigateOut(href) {
    window.open(href);
  }

  return (
    <Account>

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
          <div className="col-md-10">
            <div className="content-wrapper mb-5 cursor-pointer shadow-lg-hover" onClick={() => navigateOut('https://support.bepro.network/en/collections/3143296-bepro-holder#bepro-protocol')}>
              <div className="row">
                <div className="d-flex align-items-center mb-1">
                  <h4 className="h4 mb-0 text-white bg-opacity-100">{t('my-oracles:how-to-use')}</h4>
                  <ExternalLinkIcon className="ml-1" color="text-white-50"/>
                </div>
                <p className="caption-small text-gray">
                  {t('my-oracles:oracles-usage')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Account>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'connect-wallet-button', 'my-oracles', 'bounty', 'pull-request'])),
    },
  };
};

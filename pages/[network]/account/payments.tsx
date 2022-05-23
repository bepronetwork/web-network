import React, { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import Account from "components/account";
import Button from "components/button";
import InfiniteScroll from "components/infinite-scroll";
import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";

interface PaymentItem{
  payment:  Payment
}

const PaymentItem = function ({payment}:PaymentItem) {
  const { getURLWithNetwork } = useNetworkTheme()
  const router = useRouter()
  
  return (
    <div className="bg-dark-gray px-3 py-2 d-flex justify-content-between mt-1 rounded-5">
      <div className="d-inline-flex row flex-shirk-1">
        <span className="caption-large text-uppercase text-primary mb-1">
          {`${formatNumberToCurrency(payment?.ammount)} ${payment?.issue?.token?.symbol || 'BEPRO'}`}
        </span>
        <p className="caption-small text-uppercase text-white text-truncate">
          {payment.transactionHash}
        </p>
      </div>
      <div className="d-inline-flex align-items-center justify-content-center">
        <Button
          color="ligth-gray"
          outline
          className={"align-self-center"}
          onClick={() => {
            const [repoId, id] = payment.issue.issueId.split('/')
            router?.push(getURLWithNetwork('/bounty',{id, repoId}))
          }}
        >
          <span className="text-white text-nowrap">issue #{payment.issueId}</span>
        </Button>
      </div>
    </div>
  )
}

export default function Payments() {
  const { t } = useTranslation(["common", "bounty"]);

  const {
    state: { loading }
  } = useContext(ApplicationContext);

  const { getPayments } = useApi();
  const {wallet} = useAuthentication();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const { getURLWithNetwork } = useNetworkTheme();


  useEffect(()=>{
    if(wallet?.address)
      getPayments(wallet.address).then((data =>{
        setPayments(data);
        if (data.length) setTotal(data?.map(i=> i?.ammount)?.reduce((p,c) => p+c) || 0);
      }));
  },[wallet?.address])

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {(payments.length && (
            <div className="col-md-10">
              <div className="content-wrapper h-100">
                <div className="d-flex flex-row justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="text-primary text-uppercase">
                      {t('common:$bepro')}
                      <span className="text-white text-capitalize ms-2">{t('common:labels.recived')}</span>
                    </h4>
                  </div>
                  <div className="caption-small">
                    <span className="text-gray me-2 text-uppercase">{t('common:labels.recivedintotal')}</span>
                    <div className="d-inline-flex bg-dark-gray px-3 py-2 d-flex justify-content-between mt-1 rounded-5">
                      <span className="text-white">{formatNumberToCurrency(total)}</span>
                      <span className="text-primary ms-2">{t('common:$bepro')}</span>
                    </div>
                  </div>
                </div>
                <InfiniteScroll
                  handleNewPage={() => { }}
                  isLoading={loading.isLoading}
                  hasMore={hasMore}
                >
                  {React.Children.toArray(payments.map(payment => <PaymentItem payment={payment} />))}
                </InfiniteScroll>
              </div>
            </div>
          ) || (
              <NothingFound description={t("common:account.payments-notfound")}>
                <InternalLink
                  href={getURLWithNetwork("/developers")}
                  label={String(t("actions.view-bounties"))}
                  uppercase
                />
              </NothingFound>))
          }
        </div>
      </div>
    </Account>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "pull-request",
        "connect-wallet-button",
        "custom-network"
      ]))
    }
  };
};


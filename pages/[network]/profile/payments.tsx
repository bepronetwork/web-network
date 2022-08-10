import { useEffect, useState } from "react";
import { Col } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import PaymentsList from "components/profile/payments-list";
import ProfileLayout from "components/profile/profile-layout";
import { FlexRow } from "components/profile/wallet-balance";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

import { getCoinInfoByContract } from "services/coingecko";

import useApi from "x-hooks/use-api";

export default function Payments() {
  const { t } = useTranslation(["common", "profile"]);

  const [totalEuro, setTotalEuro] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);

  const { getPayments } = useApi();
  const { wallet } = useAuthentication();
  const { activeNetwork } = useNetwork();

  async function getCoinPrice(tokenAddress) {
    return getCoinInfoByContract(tokenAddress)
    .then(tokenInfo => tokenInfo.prices.eur)
    .catch(error => { console.log(error); return undefined; })
  }

  useEffect(() => {
    if(!wallet?.address || !activeNetwork?.name) return;

    getPayments(wallet.address, activeNetwork.name)
      .then(setPayments);
  },[wallet?.address, activeNetwork?.name])

  useEffect(() => {
    if (!payments.length) return;

    Promise.all(payments.map(async payment => ({
      tokenAddress: payment.issue.token.address, 
      value: payment.ammount,
      price: await getCoinPrice(payment.issue.token.address)
    })))
    .then(tokens => {
      const totalConverted = tokens.reduce((acc, token) => acc + (token.value * (token.price || 0)), 0);
      const noConverted = !!tokens.find(token => token.price === undefined);
      
      setTotalEuro(totalConverted);
      setHasNoConvertedToken(noConverted);
    });
  }, [payments]);
  
  return(
    <ProfileLayout>
      <Col xs={10}>
        <FlexRow className="align-items-center justify-content-between mb-4">
          <span className="family-Regular h4 text-white">{t("main-nav.nav-avatar.payments")}</span>

          <FlexRow className="align-items-center">
          {!hasNoConvertedToken ? (
              <>
                <span className="caption-medium text-white mr-2">
                  {t("labels.recivedintotal")}
                </span>
                <div className="caption-large bg-dark-gray py-2 px-3 border-radius-8">
                  <span className="text-white">
                    {formatNumberToCurrency(totalEuro)}
                  </span>

                  <span className="text-gray ml-1">{t("currencies.euro")}</span>
                </div>
              </>
            ) : (
              <span className="caption-small text-danger">
                {t("currencies.error-convert-all-to-euro")}
              </span>
            )}
          </FlexRow>
        </FlexRow>

        <PaymentsList payments={payments} />
      </Col>
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "profile",
        "connect-wallet-button",
        "bounty"
      ]))
    }
  };
};

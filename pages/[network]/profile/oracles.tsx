import { Col, Row } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import OracleIcon from "assets/icons/oracle-icon";

import Delegations from "components/delegations";
import InfoTooltip from "components/info-tooltip";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import ProfileLayout from "components/profile/profile-layout";
import TokenBalance from "components/profile/token-balance";
import { FlexRow } from "components/profile/wallet-balance";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { formatNumberToCurrency } from "helpers/formatNumber";

export default function Oracles() {
  const { t } = useTranslation(["common", "profile"]);

  const { activeNetwork } = useNetwork();
  const { wallet, updateWalletBalance } = useAuthentication();

  const oracleToken = {
    symbol: t("$oracles"),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const oraclesLocked = wallet?.balance?.oracles?.locked || 0;
  const oraclesDelegatedToMe = wallet?.balance?.oracles?.delegatedByOthers || 0;

  return(
    <ProfileLayout>
      <Col xs={10}>
        <FlexRow className="mb-3 justify-content-between align-items-center">
          <span className="h4 family-Regular text-white font-weight-medium">{t("$oracles")}</span>

          <FlexRow className="align-items-center">
            <span className="caption-large text-white mr-2 font-weight-medium">{t("misc.total")}</span>
            <span className="caption-large text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
              <span className="mr-2">{formatNumberToCurrency(oraclesLocked + oraclesDelegatedToMe)}</span>
              <InfoTooltip
                description="PLACEHOLDER"
                secondaryIcon
              />
            </span>
          </FlexRow>
        </FlexRow>

        <TokenBalance
          icon={oracleToken.icon} 
          symbol={oracleToken.symbol}
          name={`${t("misc.locked")} ${activeNetwork?.networkToken?.name || oracleToken.name}`}
          balance={oraclesLocked}
          type="oracle"
        />

        <Row className="mt-4 mb-4">
          <OraclesActions wallet={wallet} updateWalletBalance={updateWalletBalance} />

          <OraclesDelegate wallet={wallet} />
        </Row>

        <Row>
          <Delegations type="toMe" />
        </Row>

        <Row className="mb-3">
          <Delegations type="toOthers" />
        </Row>
      </Col>
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "my-oracles",
        "connect-wallet-button",
        "profile"
      ]))
    }
  };
};

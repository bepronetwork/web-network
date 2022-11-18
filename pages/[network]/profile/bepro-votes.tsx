import {useEffect} from "react";
import {Col, Row} from "react-bootstrap";

import BigNumber from "bignumber.js";
import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import OracleIcon from "assets/icons/oracle-icon";

import Delegations from "components/delegations";
import InfoTooltip from "components/info-tooltip";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import ProfileLayout from "components/profile/profile-layout";
import TokenBalance from "components/profile/token-balance";
import {FlexRow} from "components/profile/wallet-balance";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import {formatStringToCurrency} from "helpers/formatNumber";

import {useAuthentication} from "x-hooks/use-authentication";

import {useAppState} from "../../../contexts/app-state";

export default function BeproVotes() {
  const { t } = useTranslation(["common", "profile"]);

  const {state} = useAppState();

  const { updateWalletBalance } = useAuthentication();

  const oracleToken = {
    symbol: t("$oracles",   { token: state.Service?.network?.networkToken?.symbol }),
    name: t("profile:oracle-name-placeholder"),
    icon: <OracleIcon />
  };

  const oraclesLocked = state.currentUser?.balance?.oracles?.locked || BigNumber("0");
  const oraclesDelegatedToMe = state.currentUser?.balance?.oracles?.delegatedByOthers || BigNumber("0");

  useEffect(() => { updateWalletBalance(true) }, []);

  return(
    
    <ProfileLayout>
      <ReadOnlyButtonWrapper>
      <Col xs={10}>
        <FlexRow className="mb-3 justify-content-between align-items-center">
          <span className="h4 family-Regular text-white font-weight-medium">
            {t("$oracles",   { token: state.Service?.network?.networkToken?.symbol })}
          </span>

          <FlexRow className="align-items-center">
            <span className="caption-large text-white mr-2 font-weight-medium">{t("misc.total")}</span>
            <span className="caption-large text-white bg-dark-gray py-2 px-3 rounded-3 font-weight-medium">
              <span className="mr-2">
                {formatStringToCurrency(oraclesLocked.plus(oraclesDelegatedToMe).toFixed())}
              </span>

              <InfoTooltip
                description={t("profile:tips.total-oracles", {
                  tokenName: state.Service?.network?.networkToken?.name || oracleToken.name
                })}
                secondaryIcon
              />
            </span>
          </FlexRow>
        </FlexRow>

        <TokenBalance
          icon={oracleToken.icon} 
          symbol={oracleToken.symbol}
          name={`${t("misc.locked")} ${state.Service?.network?.networkToken?.name || oracleToken.name}`}
          overSymbol={t("bepro-votes")}
          balance={oraclesLocked}
          type="oracle"
        />

        <Row className="mt-4 mb-4">
          <OraclesActions 
            wallet={{
              address: state.currentUser?.walletAddress,
              balance: state.currentUser?.balance,
              isCouncil: state.Service?.network?.active?.isCouncil,
              isNetworkGovernor: state.Service?.network?.active?.isGovernor
            }}
            updateWalletBalance={() => updateWalletBalance(true) }
          />

          <OraclesDelegate 
            wallet={{
              address: state.currentUser?.walletAddress,
              balance: state.currentUser?.balance,
              isCouncil: state.Service?.network?.active?.isCouncil,
              isNetworkGovernor: state.Service?.network?.active?.isGovernor
            }}
            updateWalletBalance={() => updateWalletBalance(true) }
          />
        </Row>

        <Row>
          <Delegations type="toMe" />
        </Row>

        <Row className="mb-3">
          <Delegations type="toOthers" />
        </Row>
      </Col>
    </ReadOnlyButtonWrapper>
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

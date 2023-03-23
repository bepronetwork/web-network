import {useEffect} from "react";
import {Col, Row} from "react-bootstrap";

import BigNumber from "bignumber.js";
import clsx from "clsx";
import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import OracleIcon from "assets/icons/oracle-icon";

import Delegations from "components/delegations";
import { Divider } from "components/divider";
import Indicator from "components/indicator";
import InfoTooltip from "components/info-tooltip";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import ProfileLayout from "components/profile/profile-layout";
import TokenBalance from "components/profile/token-balance";
import {FlexRow} from "components/profile/wallet-balance";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

import {useAuthentication} from "x-hooks/use-authentication";

export default function BeproVotes() {
  const { t } = useTranslation(["common", "profile"]);

  const { state } = useAppState();
  const { updateWalletBalance } = useAuthentication();

  const { curatorAddress } = useRouter().query

  const oracleToken = {
    symbol: state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name: state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder"),
    icon: <Indicator bg={state.Service?.network?.active?.colors?.primary} size="lg" />
  };

  const votesSymbol = t("token-votes", { token: oracleToken.symbol })

  const oraclesLocked = state.currentUser?.balance?.oracles?.locked || BigNumber("0");
  const oraclesDelegatedToMe = state.currentUser?.balance?.oracles?.delegatedByOthers || BigNumber("0");

  useEffect(() => { updateWalletBalance(true) }, []);

  return(
    <ProfileLayout>
      <ReadOnlyButtonWrapper>
        <Col xs={11}>
          <FlexRow className="mb-3">
            <h3 className="text-white font-weight-500">Voting Power</h3>
          </FlexRow>

          <div className="border border-gray-800 p-4 border-radius-4">
            <FlexRow className="mb-3 justify-content-between align-items-center">
              <span className="h4 family-Regular text-white font-weight-500">
                Total Votes
              </span>

              <FlexRow className={clsx([
                "d-flex justify-content-center align-items-center gap-2 caption-large",
                "text-white bg-gray-900 py-2 px-3 border-radius-4 border border-gray-800 font-weight-medium"
              ])}>
                <span>
                  {formatStringToCurrency(oraclesLocked.plus(oraclesDelegatedToMe).toFixed())}
                </span>

                <span className="text-primary">
                  {votesSymbol}
                </span>

                <InfoTooltip
                  description={t("profile:tips.total-oracles", {
                    tokenName: state.Service?.network?.active?.networkToken?.name || oracleToken.name
                  })}
                  secondaryIcon
                />
              </FlexRow>
            </FlexRow>

            <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3">
              <span>Locked by me</span>
            </div>

            <TokenBalance
              icon={oracleToken.icon}
              overSymbol={oracleToken.symbol}
              name={votesSymbol}
              symbol={votesSymbol}
              balance={oraclesLocked}
            />

            <div className="caption-large text-capitalize family-Regular text-white font-weight-500 mb-3 mt-4">
              <span>Delegated to me</span>
            </div>

            <TokenBalance
              icon={oracleToken.icon}
              overSymbol={oracleToken.symbol}
              name={votesSymbol}
              symbol={votesSymbol}
              balance={oraclesDelegatedToMe}
            />
          </div>

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
              defaultAddress={curatorAddress?.toString()}
            />
          </Row>

          <Divider bg="gray-800" />

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

import { useEffect } from "react";
import { Row } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Delegations from "components/delegations";
import { Divider } from "components/divider";
import Indicator from "components/indicator";
import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import TotalVotes from "components/profile/pages/voting-power/total-votes";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";
import useChain from "x-hooks/use-chain";

export default function VotingPowerNetwork() {
  const { query } = useRouter();
  const { t } = useTranslation(["common", "profile"]);

  const { state } = useAppState();
  const { updateWalletBalance } = useAuthentication();
  const { chain } = useChain();

  const { curatorAddress } = query;

  const oracleToken = {
    symbol: state.Service?.network?.active?.networkToken?.symbol || t("misc.token"),
    name: state.Service?.network?.active?.networkToken?.name || t("profile:oracle-name-placeholder"),
    icon: <Indicator bg={state.Service?.network?.active?.colors?.primary} size="lg" />
  };

  const votesSymbol = t("token-votes", { token: oracleToken.symbol })

  const oraclesLocked = state.currentUser?.balance?.oracles?.locked || BigNumber("0");
  const oraclesDelegatedToMe = state.currentUser?.balance?.oracles?.delegatedByOthers || BigNumber("0");

  useEffect(() => {
    if(!state.currentUser?.walletAddress || !state.Service?.active?.network || !chain) return;

    updateWalletBalance(true);
  }, [state.currentUser?.walletAddress, state.Service?.active?.network, chain]);

  return(
    <>
      <TotalVotes
        votesLocked={oraclesLocked}
        votesDelegatedToMe={oraclesDelegatedToMe}
        icon={oracleToken.icon}
        tokenName={oracleToken.name}
        tokenSymbol={oracleToken.symbol}
        votesSymbol={votesSymbol}
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
          defaultAddress={curatorAddress?.toString()}
        />
      </Row>

      <Divider bg="gray-800" />

      <Row className="mb-3">
        <Delegations type="toOthers" />
      </Row>
    </>
  );
}
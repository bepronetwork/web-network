import { ReactElement } from "react";
import { Row } from "react-bootstrap";

import BigNumber from "bignumber.js";

import { Divider } from "components/divider";
import Delegations from "components/profile/pages/voting-power/delegations/controller";
import OraclesActions from "components/profile/pages/voting-power/oracles/actions/controller";
import OraclesDelegate from "components/profile/pages/voting-power/oracles/delegate/controller";
import TotalVotes from "components/profile/pages/voting-power/total-votes/view";

import { Balance } from "interfaces/balance-state";

interface OracleToken {
    symbol: string;
    name: string;
    icon: ReactElement;
}

interface VotingPowerNetworkViewProps {
    oraclesLocked: BigNumber;
    oraclesDelegatedToMe: BigNumber;
    oracleToken: OracleToken;
    votesSymbol: string;
    walletAddress: string;
    userBalance: Balance;
    userIsCouncil: boolean;
    userIsGovernor: boolean;
    handleUpdateWalletBalance: () => void;
    delegationAddress: string;
}

export default function VotingPowerNetworkView({
    oraclesLocked,
    oraclesDelegatedToMe,
    oracleToken,
    votesSymbol,
    walletAddress,
    userBalance,
    userIsCouncil,
    userIsGovernor,
    handleUpdateWalletBalance,
    delegationAddress
}: VotingPowerNetworkViewProps) {

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
            address: walletAddress,
            balance: userBalance,
            isCouncil: userIsCouncil,
            isNetworkGovernor: userIsGovernor
          }}
          updateWalletBalance={handleUpdateWalletBalance}
        />

        <OraclesDelegate
          wallet={{
            address: walletAddress,
            balance: userBalance,
            isCouncil: userIsCouncil,
            isNetworkGovernor: userIsGovernor
          }}
          updateWalletBalance={handleUpdateWalletBalance}
          defaultAddress={delegationAddress}
        />
      </Row>

      <Divider bg="gray-800" />

      <Row className="mb-3">
        <Delegations type="toOthers" />
      </Row>
    </>
  );
}
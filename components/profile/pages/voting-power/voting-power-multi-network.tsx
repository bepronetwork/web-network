import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { ContextualSpan } from "components/contextual-span";
import If from "components/If";
import Indicator from "components/indicator";
import NetworkColumns from "components/profile/network-columns";
import NetworkItem from "components/profile/network-item";
import TotalVotes from "components/profile/pages/voting-power/total-votes";

import { useAppState } from "contexts/app-state";

import useApi from "x-hooks/use-api";

export default function VotingPowerMultiNetwork() {
  const { t } = useTranslation("common");

  const [networks, setNetworks] = useState([]);

  const { state } = useAppState();
  const { searchCurators } = useApi();

  useEffect(() => {
    if (state.currentUser?.walletAddress)
      searchCurators({
        address: state.currentUser?.walletAddress
      })
        .then(({ rows }) => setNetworks(rows))
        .catch(error => console.debug("Failed to fetch voting power data", error));
  }, [state.currentUser?.walletAddress]);

  return(
    <>
      <div className="mt-5">
        <ContextualSpan
          context="info"
          isAlert
          isDismissable
        >
          <span>To manage your voting power you need to be in a especific network</span>
        </ContextualSpan>
      </div>

      <If condition={!!networks.length}>
        <div className="mt-5">
          <NetworkColumns
            columns={["Network name", "Total votes", "Network link"]}
          />

          { !!networks.length && networks.map(({ tokensLocked, delegatedToMe, network}) =>
            <NetworkItem
                key={network?.networkAddress}
                type="network"
                networkName={network?.name}
                iconNetwork={network?.logoIcon}
                amount={BigNumber(tokensLocked).plus(delegatedToMe).toFixed()}
                symbol={`${network?.networkToken?.symbol} ${t("misc.votes")}`}
            >
              <TotalVotes
                votesLocked={BigNumber(tokensLocked)}
                votesDelegatedToMe={BigNumber(delegatedToMe)}
                icon={<Indicator bg={network?.colors?.primary} size="lg" />}
                tokenName={network?.networkToken?.name}
                tokenSymbol={network?.networkToken?.symbol}
                votesSymbol={`${network?.networkToken?.symbol} ${t("misc.votes")}`}
                variant="multi-network"
              />
            </NetworkItem>)
            }
        </div>
      </If>
    </>
  );
}
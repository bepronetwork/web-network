import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { ContextualSpan } from "components/contextual-span";
import Delegations from "components/delegations";
import If from "components/If";
import Indicator from "components/indicator";
import NetworkColumns from "components/profile/network-columns";
import NetworkItem from "components/profile/network-item/controller";
import TotalVotes from "components/profile/pages/voting-power/total-votes";

import { useAppState } from "contexts/app-state";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

export default function VotingPowerMultiNetwork() {
  const { push } = useRouter();
  const { t } = useTranslation(["common", "profile"]);

  const [networks, setNetworks] = useState([]);

  const { state } = useAppState();
  const { searchCurators } = useApi();
  const { getURLWithNetwork } = useNetwork();

  function goToNetwork(network) {
    return () => {
      push(getURLWithNetwork("/bounties", {
        network: network?.name,
        chain: network?.chain?.chainShortName
      }));
    };
  }

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
          <span>{t("profile:need-network-to-manage")}</span>
        </ContextualSpan>
      </div>

      <If condition={!!networks.length}>
        <div className="mt-5">
          <NetworkColumns
            columns={[
              t("profile:network-columns.network-name"),
              t("profile:network-columns.total-votes"),
              t("profile:network-columns.network-link"),
              ""
            ]}
          />

          { !!networks.length && networks.map(({ tokensLocked, delegatedToMe, delegations, network }) =>
            <NetworkItem
                key={network?.networkAddress}
                type="network"
                networkName={network?.name}
                iconNetwork={network?.logoIcon}
                primaryColor={network?.colors?.primary}
                amount={BigNumber(tokensLocked).plus(delegatedToMe).toFixed()}
                symbol={`${network?.networkToken?.symbol} ${t("misc.votes")}`}
                variant="multi-network"
                handleNetworkLink={goToNetwork(network)}
            >
              <div className="col">
                <TotalVotes
                  votesLocked={BigNumber(tokensLocked)}
                  votesDelegatedToMe={BigNumber(delegatedToMe)}
                  icon={<Indicator bg={network?.colors?.primary} size="lg" />}
                  tokenColor={network?.colors?.primary}
                  tokenName={network?.networkToken?.name}
                  tokenSymbol={network?.networkToken?.symbol}
                  votesSymbol={`${network?.networkToken?.symbol} ${t("misc.votes")}`}
                  variant="multi-network"
                />

                <div className="mt-3">
                  <Delegations
                    type="toOthers"
                    delegations={delegations}
                    variant="multi-network"
                    tokenColor={network?.colors?.primary}
                  />
                </div>
              </div>
            </NetworkItem>)
            }
        </div>
      </If>
    </>
  );
}
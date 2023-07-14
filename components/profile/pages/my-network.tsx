import {useEffect, useState} from "react";
import {Col} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";
import MyNetworkSettings from "components/profile/my-network-settings";
import ProfileLayout from "components/profile/profile-layout";

import {useAppState} from "contexts/app-state";
import {NetworkSettingsProvider, useNetworkSettings} from "contexts/network-settings";
import {changeLoadState} from "contexts/reducers/change-load";

import {Network} from "interfaces/network";

import { SearchBountiesPaginated } from "types/api";
import { MyNetworkPageProps } from "types/pages";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";

interface MyNetworkProps {
  bounties: SearchBountiesPaginated;
}

export function MyNetwork({
  bounties
}: MyNetworkProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [myNetwork, setMyNetwork] = useState<Network>();

  const { state, dispatch } = useAppState();

  const { chain } = useChain();
  const { searchNetworks } = useApi();
  const { setForcedNetwork } = useNetworkSettings();

  const defaultNetworkName = state?.Service?.network?.active?.name?.toLowerCase();

  async function updateEditingNetwork() {
    dispatch(changeLoadState(true));

    const chainId = chain.chainId.toString();

    searchNetworks({
      creatorAddress: state.currentUser.walletAddress,
      isClosed: false,
      chainId: chainId
    })
      .then(({ count , rows }) => {
        const savedNetwork = count > 0 ? rows[0] : undefined;

        if (savedNetwork)
          sessionStorage.setItem(`bepro.network:${savedNetwork.name.toLowerCase()}:${chainId}`,
                                 JSON.stringify(savedNetwork));

        setMyNetwork(savedNetwork);
        setForcedNetwork(savedNetwork);
      })
      .catch(error => console.debug("Failed to get network", error))
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !chain) return;

    updateEditingNetwork();
  }, [state.currentUser?.walletAddress, chain]);

  return(
    <ProfileLayout>
      { !myNetwork &&
        <Col className="pt-5">
          <NothingFound description={t("custom-network:errors.not-found")}>
            <InternalLink
              href={
                state.Service?.network?.active?.name?.toLowerCase() === defaultNetworkName
                  ? "/new-network"
                  : "/networks"
              }
              label={String(t("actions.create-one"))}
              uppercase
            />
          </NothingFound>
        </Col>
      ||
        <Col xs={12} xl={10}>
          <MyNetworkSettings
            bounties={bounties}
            network={myNetwork}
            updateEditingNetwork={updateEditingNetwork}
          />
        </Col>
      }
    </ProfileLayout>
  );
}

export default function MyNetworkPage({
  bounties
}: MyNetworkPageProps) {
  return(
    <NetworkSettingsProvider>
      <MyNetwork bounties={bounties} />
    </NetworkSettingsProvider>
  );
}
import {ReactElement, ReactNode, useEffect, useState} from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";
import {useRouter} from "next/router";

import ExternalLinkIcon from "assets/icons/external-link-icon";
import HelpIcon from "assets/icons/help-icon";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import ContractButton from "components/contract-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import BrandLogo from "components/main-nav/brand-logo";
import NavLinks from "components/main-nav/nav-links";
import NavAvatar from "components/nav-avatar";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import SelectChainDropdown from "components/select-chain-dropdown";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";

import {useAppState} from "contexts/app-state";
import { changeCurrentUserHasRegisteredNetwork } from "contexts/reducers/change-current-user";

import { SupportedChainData } from "interfaces/supported-chain-data";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import { useDao } from "x-hooks/use-dao";
import { useNetwork } from "x-hooks/use-network";
import useNetworkChange from "x-hooks/use-network-change";

interface MyNetworkLink {
  href: string;
  label: string | ReactElement;
  icon?: ReactNode;
}

export default function MainNav() {
  const { t } = useTranslation("common");
  const { pathname, query, asPath, push } = useRouter();

  const newNetworkObj = {
    label: <Translation label={"main-nav.new-network"} />,
    href: "/new-network",
    icon: <PlusIcon />
  };

  const [showHelp, setShowHelp] = useState(false);
  const [myNetwork, setMyNetwork] = useState<MyNetworkLink>(newNetworkObj);

  const { connect } = useDao();
  const { chain } = useChain();
  const { state } = useAppState();
  const { dispatch } = useAppState();
  const { searchNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();
  const { handleAddNetwork } = useNetworkChange();

  const noNeedNetworkInstance = !query?.network;

  const networkLogo = state.Service?.network?.active?.fullLogo;
  const fullLogoUrl = networkLogo && `${state.Settings?.urls?.ipfs}/${networkLogo}`;
  const brandHref = noNeedNetworkInstance ? "/" : getURLWithNetwork("/", {
    network: state.Service?.network?.active?.name,
  });


  function getChainShortName() {
    const availableChains = state.Service?.network?.availableChains;
    const isOnAvailableChain = availableChains?.find(({ chainId }) => +chainId === +state.connectedChain?.id);

    if (chain) return chain.chainShortName;

    if (isOnAvailableChain) {
      return isOnAvailableChain.chainShortName;
    }

    if (availableChains?.length) return availableChains[0].chainShortName;

    return null;
  }

  const links = [
    {
      href: getURLWithNetwork("/", {
        chain: getChainShortName()
      }),
      label: t("main-nav.nav-avatar.bounties"),
      isVisible: !noNeedNetworkInstance
    },
    {
      href: getURLWithNetwork("/curators"),
      label: t("main-nav.council"),
      isVisible: !noNeedNetworkInstance && pathname !== "/[network]"
    },
    {
      href: "/networks",
      label: t("main-nav.networks"),
      isVisible: true
    },
    {
      href: "/leaderboard",
      label: t("main-nav.leaderboard"),
      isVisible: true
    },
    {
      href: "/explore",
      label: t("main-nav.explore"),
      isVisible: true
    }
  ];

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.connectedChain?.id)
      return;

    searchNetworks({
      creatorAddress: state.currentUser?.walletAddress,
      chainId: state.connectedChain?.id,
      isClosed: false
    })
      .then(({ count, rows }) => {
        const changeIfDifferent = (has: boolean) => state.currentUser?.hasRegisteredNetwork !== has &&
          dispatch(changeCurrentUserHasRegisteredNetwork(has));

        if (count === 0) {
          setMyNetwork(newNetworkObj);
          changeIfDifferent(false);
        } else {
          const networkName = rows[0]?.name?.toLowerCase();
          const chainShortName = rows[0]?.chain?.chainShortName?.toLowerCase();

          changeIfDifferent(!!rows[0]?.isRegistered);

          setMyNetwork({
            label: <Translation label={"main-nav.my-network"} />,
            href: `/${networkName}/${chainShortName}${rows[0]?.isRegistered ? "" : "/profile/my-network"}`
          });
        }
      })
      .catch(error => console.debug("Failed to get network address by wallet", error));
  }, [state.currentUser?.walletAddress, state.connectedChain]);

  function handleNewBounty () {
    push('/create-bounty')
  }

  async function handleNetworkSelected(chain: SupportedChainData) {
    if (noNeedNetworkInstance) {
      handleAddNetwork(chain)
        .then(() => {
          if (state.currentUser?.walletAddress) return;

          connect();
        })
        .catch(() => null);

      return;
    }

    const needsRedirect = ["bounty", "pull-request", "proposal"].includes(pathname.replace("/[network]/[chain]/", ""));
    const newPath = needsRedirect ? "/" : pathname;
    const newAsPath = needsRedirect ? `/${query.network}/${chain.chainShortName}` :
      asPath.replace(query.chain.toString(), chain.chainShortName);

    push(getURLWithNetwork(newPath, {
      ... needsRedirect ? {} : query,
      chain: chain.chainShortName
    }), newAsPath);
  }

  return (
    <div className="nav-container">
      <ClosedNetworkAlert
        isVisible={!noNeedNetworkInstance && state.Service?.network?.active?.isClosed}
      />

      <div className="main-nav d-flex flex-column justify-content-center">
        <div
          className={clsx([
            "d-flex flex-row align-items-center justify-content-between px-3",
            state.currentUser?.walletAddress ? "py-0" : "py-3"
          ])}
        >
          <div className="d-flex gap-4">
            <BrandLogo
              href={brandHref}
              logoUrl={fullLogoUrl}
              showDefaultBepro={noNeedNetworkInstance}
            />

            <SelectChainDropdown
              onSelect={(chain) => handleNetworkSelected(chain)}
              isOnNetwork={!noNeedNetworkInstance}
              className="select-network-dropdown"
            />

            <NavLinks
              links={links}
            />
          </div>

          <div className="d-flex flex-row align-items-center gap-3">
              <ReadOnlyButtonWrapper>
                <ContractButton
                  outline
                  onClick={handleNewBounty}
                  textClass="text-white"
                  className="read-only-button"
                >
                  <PlusIcon />
                  <span>{t("main-nav.new-bounty")}</span>
                </ContractButton>
              </ReadOnlyButtonWrapper>
              {noNeedNetworkInstance && (
                <InternalLink
                  href={myNetwork.href}
                  icon={myNetwork.icon}
                  label={myNetwork.label}
                  iconBefore
                  uppercase
                  outline
                />
              )}

            <Button
              onClick={() => setShowHelp(true)}
              className="bg-gray-850 border-gray-850 rounded p-2"
              transparent
            >
              <HelpIcon />
            </Button>

            <ConnectWalletButton>
              <TransactionsStateIndicator />

              <NavAvatar />
            </ConnectWalletButton>
          </div>

          <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
        </div>
      </div>
    </div>
  );
}

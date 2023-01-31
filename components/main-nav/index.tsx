import {ReactElement, ReactNode, useEffect, useState} from "react";

import {Defaults} from "@taikai/dappkit";
import clsx from "clsx";
import { useTranslation } from "next-i18next";
import {useRouter} from "next/router";

import HelpIcon from "assets/icons/help-icon";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import BrandLogo from "components/main-nav/brand-logo";
import NavAvatar from "components/nav-avatar";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import SelectNetworkDropdown from "components/select-network-dropdown";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";
import WrongNetworkModal from "components/wrong-network-modal";

import {useAppState} from "contexts/app-state";
import {changeShowCreateBounty, changeShowWeb3} from "contexts/reducers/update-show-prop";

import { SupportedChainData } from "interfaces/supported-chain-data";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";
import useNetworkChange from "x-hooks/use-network-change";

import NavLinks from "./nav-links";

interface MyNetworkLink {
  href: string;
  label: string | ReactElement;
  icon?: ReactNode;
}

export default function MainNav() {
  const { pathname, query, asPath, push } = useRouter();
  const { t } = useTranslation("common");

  const [showHelp, setShowHelp] = useState(false);
  const [myNetwork, setMyNetwork] = useState<MyNetworkLink>({ 
    label: <Translation label={"main-nav.new-network"} />, 
    href: "/new-network", 
    icon: <PlusIcon /> 
  });
  
  const { state } = useAppState();
  const { dispatch } = useAppState();
  const { searchNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();
  const { handleAddNetwork } = useNetworkChange();

  const noNeedNetworkInstance = [
    "/",
    "/networks", 
    "/new-network", 
    "/explore", 
    "/leaderboard", 
    "/setup"
  ].includes(pathname);

  const networkLogo = state.Service?.network?.active?.fullLogo;
  const fullLogoUrl = networkLogo && `${state.Settings?.urls?.ipfs}/${networkLogo}`;
  const brandHref = noNeedNetworkInstance ? "/" : getURLWithNetwork("/", {
    network: state.Service?.network?.active?.name,
  });

  const links = [
    {
      href: noNeedNetworkInstance ? "/bounty-hall" : getURLWithNetwork("/"),
      label: t("main-nav.nav-avatar.bounties"),
      isVisible: true
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
    }
  ];

  useEffect(() => {
    if (!state.Service?.active ||
        !state.currentUser?.walletAddress ||
        !noNeedNetworkInstance) return;

    state.Service?.active.getNetworkAdressByCreator(state.currentUser.walletAddress)
      .then(async networkAddress => {
        if (networkAddress === Defaults.nativeZeroAddress) 
          return setMyNetwork({ 
            label: <Translation label={"main-nav.new-network"} />, 
            href: "/new-network", 
            icon: <PlusIcon /> 
          });

        const network = await searchNetworks({ networkAddress }).then(({ rows }) => rows[0]);

        setMyNetwork({ 
          label: <Translation label={"main-nav.my-network"} />, 
          href: `/${network?.name?.toLowerCase()}${network?.isRegistered ? "" : "/profile/my-network"}`
        });
      })
      .catch(error => console.debug("Failed to get network address by wallet", error));
  }, [state.Service?.active, state.currentUser?.walletAddress, noNeedNetworkInstance]);

  function handleNewBounty () {
    if(!window.ethereum) return dispatch(changeShowWeb3(true));

    return dispatch(changeShowCreateBounty(true));

  }

  function handleNetworkSelected(chain: SupportedChainData) {
    if (noNeedNetworkInstance) {
      handleAddNetwork(chain).catch(() => null);
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
        isVisible={state.Service?.network?.active?.isClosed}
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

            <SelectNetworkDropdown 
              onSelect={(chain) => handleNetworkSelected(chain)}
              isOnNetwork={!noNeedNetworkInstance}
              className="select-network-dropdown"
            />

            <NavLinks
              links={links}
            />
          </div>

          <div className="d-flex flex-row align-items-center gap-20">
            {(!noNeedNetworkInstance && (
              <ReadOnlyButtonWrapper>
                <Button
                  outline
                  onClick={handleNewBounty}
                  textClass="text-white"
                  className="read-only-button"
                >
                  <PlusIcon />
                  <span><Translation label={"main-nav.new-bounty"} /></span>
                </Button>
              </ReadOnlyButtonWrapper>
            )) || (
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
              className="opacity-75 opacity-100-hover"
              transparent
              rounded
            >
              <HelpIcon />
            </Button>

            <WrongNetworkModal />

            <ConnectWalletButton>
              <>
                <TransactionsStateIndicator />

                <NavAvatar />
              </>
            </ConnectWalletButton>
          </div>
          <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
        </div>
      </div>
    </div>
  );
}

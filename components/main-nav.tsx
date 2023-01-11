import {ReactElement, ReactNode, useEffect, useState} from "react";

import {Defaults} from "@taikai/dappkit";
import {useRouter} from "next/router";

import HelpIcon from "assets/icons/help-icon";
import LogoPlaceholder from "assets/icons/logo-placeholder";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import NavAvatar from "components/nav-avatar";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";
import WrongNetworkModal from "components/wrong-network-modal";

import {useAppState} from "contexts/app-state";
import {changeShowCreateBounty, changeShowWeb3} from "contexts/reducers/update-show-prop";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network-theme";

interface MyNetworkLink {
  href: string;
  label: string | ReactElement;
  icon?: ReactNode;
}

export default function MainNav() {
  const { pathname } = useRouter();

  const [showHelp, setShowHelp] = useState(false);
  const {dispatch} = useAppState();
  const [myNetwork, setMyNetwork] = useState<MyNetworkLink>({ 
    label: <Translation label={"main-nav.new-network"} />, 
    href: "/new-network", 
    icon: <PlusIcon /> 
  });

  const {state} = useAppState();
  const { searchNetworks } = useApi();
  const { getURLWithNetwork } = useNetworkTheme();

  const isNetworksPage = ["/networks", "/new-network"].includes(pathname);
  const fullLogoUrl = state.Service?.network?.active?.fullLogo;

  useEffect(() => {
    if (!state.Service?.active || !state.currentUser?.walletAddress || !isNetworksPage) return;

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
      .catch(console.log);
  }, [state.Service?.active, state.currentUser?.walletAddress, isNetworksPage]);

  function handleNewBounty () {
    if(!window.ethereum) return dispatch(changeShowWeb3(true))
    return dispatch(changeShowCreateBounty(true))
    
  } 


  function LinkLeaderBoard() {
    return (
      <InternalLink
      href={"/leaderboard"}
      label={<Translation label={"main-nav.leaderboard"} />}
      nav
      uppercase
    />
    )
  }

  function LinkBounties() {
    return (
      <InternalLink
        href={"/bounties"}
        label={<Translation label={"main-nav.nav-avatar.bounties"} />}
        nav
        uppercase
      />
    )
  }

  const brandLogo = !isNetworksPage ? (
      <InternalLink
        href={getURLWithNetwork("/", {
          network: state.Service?.network?.active?.name,
        })}
        icon={
          fullLogoUrl ? (
            <img
              src={`${state.Settings?.urls?.ipfs}/${fullLogoUrl}`}
              width={104}
              height={40}
            />
          ) : (
            <LogoPlaceholder />
          )
        }
        className="brand"
        nav
        active
        brand
      />
    ): (
      <InternalLink
        href={'/'}
        icon={                  
            <img
              src={`/images/Bepro_Logo_Light.svg`}
              width={104}
              height={40}
            />                  
        }
        className="brand"
        nav
        active
        brand
      />
  );

  return (
    <div className="nav-container">
      {state.Service?.network?.active?.isClosed && <ClosedNetworkAlert />}
      <div className="main-nav d-flex flex-column justify-content-center">
        <div
          className={`d-flex flex-row align-items-center justify-content-between px-3 ${
            state.currentUser?.walletAddress ? "py-0" : "py-3"
          }`}
        >
          <div className="d-flex">
            {brandLogo}
            {(!isNetworksPage && (
              <ul className="nav-links">
                <li>
                  <LinkBounties />
                </li>

                <li>
                  <InternalLink
                    href={getURLWithNetwork("/curators")}
                    label={<Translation label={"main-nav.council"} />}
                    nav
                    uppercase
                  />
                </li>
                <li>
                  <InternalLink
                    href={"/networks"}
                    label={<Translation label={"main-nav.networks"} />}
                    nav
                    uppercase
                  />
                </li>
                <li>
                  <LinkLeaderBoard />
                </li>
              </ul>
            )) || (
              <ul className="nav-links">
                <li>
                  <LinkBounties />
                </li>
                <li>
                  <LinkLeaderBoard />
                </li>
              </ul>
            )}
          </div>

          <div className="d-flex flex-row align-items-center gap-20">
            {(!isNetworksPage && (
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

            <WrongNetworkModal requiredNetworkId={state.Settings?.requiredChain?.id} />

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

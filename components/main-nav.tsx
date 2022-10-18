import { ReactElement, ReactNode, useContext, useEffect, useState } from "react";

import { Defaults } from "@taikai/dappkit";
import { useRouter } from "next/router";

import BeproLogoBlue from "assets/icons/bepro-logo-blue";
import HelpIcon from "assets/icons/help-icon";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ClosedNetworkAlert from "components/closed-network-alert";
import ConnectWalletButton from "components/connect-wallet-button";
import HelpModal from "components/help-modal";
import InternalLink from "components/internal-link";
import NavAvatar from "components/nav-avatar";
import TransactionsStateIndicator from "components/transactions-state-indicator";
import Translation from "components/translation";
import WrongNetworkModal from "components/wrong-network-modal";

import { AppStateContext } from "contexts/app-state";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import { useSettings } from "contexts/settings";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network-theme";
import {changeShowCreateBounty, changeShowWeb3} from "../contexts/reducers/update-show-prop";

import ReadOnlyButtonWrapper from "./read-only-button-wrapper";

interface MyNetworkLink {
  href: string;
  label: string | ReactElement;
  icon?: ReactNode;
}

export default function MainNav() {
  const { pathname } = useRouter();

  const [showHelp, setShowHelp] = useState(false);
  const {
    dispatch
  } = useContext(AppStateContext);
  const [myNetwork, setMyNetwork] = useState<MyNetworkLink>({ 
    label: <Translation label={"main-nav.new-network"} />, 
    href: "/new-network", 
    icon: <PlusIcon /> 
  });

  const { settings } = useSettings();
  const { searchNetworks } = useApi();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { network, getURLWithNetwork } = useNetwork();

  const isNetworksPage = ["/networks", "/new-network"].includes(pathname);
  const isBeproNetwork = [
    !network?.name,
    !settings?.defaultNetworkConfig?.name,
    network?.name === settings?.defaultNetworkConfig?.name
  ].some(c => c);

  useEffect(() => {
    if (!DAOService || !wallet?.address || !isNetworksPage) return;

    DAOService.getNetworkAdressByCreator(wallet.address)
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
  }, [DAOService, wallet?.address, isNetworksPage]);

  function handleNewBounty () {
    if(!window.ethereum) return dispatch(changeShowWeb3(true))
    return dispatch(changeShowCreateBounty(true))
  } 

  return (
    <div className="nav-container">
      {network?.isClosed && <ClosedNetworkAlert />}
      <div
        className={`main-nav d-flex flex-column justify-content-center
          bg-${isBeproNetwork || isNetworksPage ? "dark" : "primary"}`}
      >
        <div
          className={`d-flex flex-row align-items-center justify-content-between px-3 ${
            wallet?.address ? "py-0" : "py-3"
          }`}
        >
          <div className="d-flex">
            <InternalLink
              href={getURLWithNetwork("/", { network: network?.name })}
              icon={
                !isBeproNetwork ? (
                  <img
                    src={`${settings?.urls?.ipfs}/${network?.fullLogo}`}
                    width={104}
                    height={32}
                  />
                ) : (
                  <BeproLogoBlue />
                )
              }
              className="brand"
              nav
              active
              brand
            />
            {(!isNetworksPage && (
              <ul className="nav-links">
                <li>
                  <InternalLink
                    href={getURLWithNetwork("/developers")}
                    label={<Translation label={"main-nav.developers"} />}
                    nav
                    uppercase
                  />
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
              </ul>
            )) ||
              ""}
          </div>

          <div className="d-flex flex-row align-items-center gap-20">
            {(!isNetworksPage && (
              <ReadOnlyButtonWrapper>
                <Button 
                  outline
                  onClick={handleNewBounty}
                  textClass="text-white"
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

            <WrongNetworkModal requiredNetworkId={settings?.requiredChain?.id} />

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

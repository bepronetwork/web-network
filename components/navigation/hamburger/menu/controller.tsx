import { useState } from "react";

import { useRouter } from "next/router";

import HamburgerMenuView from "components/navigation/hamburger/menu/view";

import { useAppState } from "contexts/app-state";

import { NAVIGATION_LINKS } from "helpers/navigation-links";
import { isOnNetworkPath } from "helpers/network";

import { Link } from "types/utils";

import { useAuthentication } from "x-hooks/use-authentication";
import { useNetwork } from "x-hooks/use-network";

interface MenuDrawerProps {
  show: boolean;
  onHide: () => void;
}

export default function HamburgerMenu({
  show,
  onHide
}: MenuDrawerProps) {
  const { pathname } = useRouter();
  
  const [isProfileLinksVisible, setIsProfileLinksVisible] = useState(false);
  
  const { state } = useAppState();
  const { signOut } = useAuthentication();
  const { getURLWithNetwork } = useNetwork();

  const isOnNetwork = isOnNetworkPath(pathname);

  const { network, global, both } = NAVIGATION_LINKS;

  const links = ((isOnNetwork ? network.map(({ label, href }) => ({
    href: getURLWithNetwork(href),
    label
  })) : global) as Link[]).concat(both as Link[]);

  function handleDisconnect() {
    setIsProfileLinksVisible(false);
    onHide();
    signOut();
  }

  function handleShowProfileLinks() {
    setIsProfileLinksVisible(true);
  }

  function handleHideProfileLinks() {
    setIsProfileLinksVisible(false);
  }

  function handleHideDrawer() {
    handleHideProfileLinks();
    onHide();
  }

  return(
    <HamburgerMenuView
      show={show}
      userLogin={state.currentUser?.login}
      userAddress={state.currentUser?.walletAddress}
      isConnected={!!state.currentUser?.walletAddress}
      isProfileLinksVisible={isProfileLinksVisible}
      onDisconnect={handleDisconnect}
      onShowProfileLinks={handleShowProfileLinks}
      onHideProfileLinks={handleHideProfileLinks}
      onHideHamburger={handleHideDrawer}
      links={links}
    />
  );
}
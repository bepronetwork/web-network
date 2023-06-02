import { useState } from "react";

import HamburgerMenuView from "components/navigation/hamburger/menu/view";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

interface MenuDrawerProps {
  show: boolean;
  onHide: () => void;
}

export default function HamburgerMenu({
  show,
  onHide
}: MenuDrawerProps) {
  const [isProfileLinksVisible, setIsProfileLinksVisible] = useState(false);
  
  const { state } = useAppState();
  const { disconnectWallet } = useAuthentication();

  function handleDisconnect() {
    setIsProfileLinksVisible(false);
    onHide();
    disconnectWallet();
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
    />
  );
}
import React, { useState } from "react";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

import ProfilePageView from "./view";

export default function ProfilePage() {

  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const { state } = useAppState();

  const { signOut } = useAuthentication();

  const handleClickDisconnect = () => setShowRemoveModal(true);
  const hideRemoveModal = () => setShowRemoveModal(false);

  return (
    <ProfilePageView
      userLogin={state.currentUser?.login}
      walletAddress={state.currentUser?.walletAddress}
      isCouncil={state.Service?.network?.active?.isCouncil}
      handleClickDisconnect={handleClickDisconnect}
      hideRemoveModal={hideRemoveModal}
      showRemoveModal={showRemoveModal}
      disconnectGithub={signOut}
    />
  );
}

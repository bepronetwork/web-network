import {useState} from "react";

import {useTranslation} from "next-i18next";

import {useAppState} from "../../../../../contexts/app-state";
import {toastError, toastSuccess} from "../../../../../contexts/reducers/change-toaster";

import {Network} from "../../../../../interfaces/network";

import {
  CreateBannedWord,
  getBannedWordsData,
  RemoveBannedWord
} from "../../../../../x-hooks/api/network/management/banned-words";

import NetworkPermissionsView from "./view";

interface NetworkPermissionsProps {
  network: Network;
}

export default function NetworkPermissions({
  network,
}: NetworkPermissionsProps) {
  const { t } = useTranslation(["custom-network"]);
  const [currentDomains, setCurrentDomains] = useState<string[]>(network?.banned_domains);
  const [currentDomain, setCurrentDomain] = useState<string>();

  const { dispatch } = useAppState();

  function onChangeDomain(v: string) {
    setCurrentDomain(v);
  }

  function updateCurrentDomains() {
    getBannedWordsData(network.id).then((value) => {
      setCurrentDomains(value)
    })
  }

  function handleAddDomain() {
    CreateBannedWord(network.id, {
      banned_domain: currentDomain,
      networkAddress: network?.networkAddress?.toLowerCase(),
    }).then(() => {
      dispatch(toastSuccess(t("steps.permissions.domains.created-message")));
      updateCurrentDomains()
      setCurrentDomain("")
    }).catch(err => {
      if(err.response?.status === 409){
        return dispatch(toastError(t("steps.permissions.domains.already-exists")));
      }
      console.debug("Error create banned word", err);
      return dispatch(toastError(t("steps.permissions.domains.created-error")));
    })
  }

  function handleRemoveDomain(domain: string) {
    RemoveBannedWord(network.id, {
      banned_domain: domain,
      networkAddress: network?.networkAddress?.toLowerCase(),
    }).then(() => {
      dispatch(toastSuccess(t("steps.permissions.domains.remove-message")));
      updateCurrentDomains()
    }).catch(err => {
      if(err.response?.status === 404){
        return dispatch(toastError(t("steps.permissions.domains.remove-not-found")));
      }
      console.debug("Error remove banned word", err);
      return dispatch(toastError(t("steps.permissions.domains.remove-error")));
    })
  }

  return (
    <NetworkPermissionsView
      domain={currentDomain}
      domains={currentDomains}
      onChangeDomain={onChangeDomain}
      handleAddDomain={handleAddDomain}
      handleRemoveDomain={handleRemoveDomain}
    />
  );
}

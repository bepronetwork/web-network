import { ChangeEvent } from "react";

import NetworkRepositoriesSettingsView from "components/network/settings/repositories/view";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

export default function NetworkRepositoriesSettings() {
  const { state } = useAppState();
  const { fields, github } = useNetworkSettings();

  function changeAllowMergeCheckbox(e: ChangeEvent<HTMLInputElement>) {
    fields.allowMerge.setter(e?.target?.checked);
  }

  return(
    <NetworkRepositoriesSettingsView
      isGithubConnected={!!state.currentUser?.login}
      repositories={github.repositories}
      botUser={state.Settings?.github?.botUser}
      allowMerge={github?.allowMerge}
      onRepositoryClick={fields.repository.setter}
      onAllowMergeClick={changeAllowMergeCheckbox}
    />
  );
}

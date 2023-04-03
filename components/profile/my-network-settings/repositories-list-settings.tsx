import { FormCheck, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

export default function RepositoriesListSettings() {
  const { t } = useTranslation(["common", "custom-network"]);

  const { state } = useAppState();
  const { fields, github } = useNetworkSettings();

  function changeAllowMergeCheckbox(ele) {
    fields.allowMerge.setter(ele?.target?.checked);
  }

  return (
    <Row className="mt-4">
      <span className="caption-medium text-white mb-3">
        {t("custom-network:steps.repositories.label")}
      </span>

      {(!state.currentUser?.login && <ConnectGithub />) || (
        <RepositoriesList
          repositories={github.repositories}
          onClick={fields.repository.setter}
          withLabel={false}
          botUser={state.Settings?.github?.botUser}
        />
      )}

      <div className="d-flex align-items-center p-small text-white">
        <FormCheck
            className="form-control-lg px-0 pb-0 mr-1"
            type="checkbox"
            onChange={changeAllowMergeCheckbox}
            checked={github?.allowMerge}
          />
        <span>
          {t("custom-network:allow-merge")}
        </span>
      </div>
    </Row>
  );
}

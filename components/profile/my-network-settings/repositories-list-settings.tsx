import { Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";

export default function RepositoriesListSettings() {
  const { t } = useTranslation(["common", "custom-network"]);
  const { fields, github } = useNetworkSettings();
  const { state } = useAppState();

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
        />
      )}
    </Row>
  );
}

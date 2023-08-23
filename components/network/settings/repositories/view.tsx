import { ChangeEvent } from "react";
import { FormCheck, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";


import RepositoriesList from "components/custom-network/repositories-list";
import NetworkTabContainer from "components/network/settings/tab-container/view";

import { Repository } from "interfaces/network";

interface NetworkRepositoriesSettingsViewProps {
  repositories: Repository[];
  botUser: string;
  allowMerge: boolean;
  onRepositoryClick: (repositoryFullName: string) => void;
  onAllowMergeClick: (value: ChangeEvent<HTMLInputElement>) => void;
}

export default function NetworkRepositoriesSettingsView({
  repositories,
  botUser,
  allowMerge,
  onRepositoryClick,
  onAllowMergeClick,
}: NetworkRepositoriesSettingsViewProps) {
  const { t } = useTranslation(["common", "custom-network"]);
  
  return (
    <NetworkTabContainer>
      <Row className="mt-4">
        <span className="caption-medium font-weight-medium text-white mb-3">
          {t("custom-network:steps.repositories.label")}
        </span>
        
        <RepositoriesList
          repositories={repositories}
          onClick={onRepositoryClick}
          withLabel={false}
          botUser={botUser}
        />

        <div className="d-flex align-items-center p-small text-white mt-4">
          <FormCheck
            className="form-control-lg px-0 pb-0 mr-1"
            type="checkbox"
            onChange={onAllowMergeClick}
            checked={allowMerge}
          />

          <span>
            {t("custom-network:allow-merge")}
          </span>
        </div>
      </Row>
    </NetworkTabContainer>
  );
}
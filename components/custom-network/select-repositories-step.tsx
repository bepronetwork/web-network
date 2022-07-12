import { FormCheck } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";
import Step from "components/step";

import { useAuthentication } from "contexts/authentication";
import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

const { publicRuntimeConfig } = getConfig();

export default function SelectRepositoriesStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation("custom-network");

  const { user } = useAuthentication();
  const { github, fields } = useNetworkSettings();

  function handleRepositoryCheck(fullName: string) {
    fields.repository.setter(fullName);
  }

  function handlePermissonCheck(e) {
    fields.permission.setter(e.target.checked);
  }

  return (
    <Step
      title={t("steps.repositories.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      {(user?.login && (
        <div>
          <RepositoriesList repositories={github.repositories} onClick={handleRepositoryCheck} />

          <span className="caption-small text-gray px-0 mt-3">
            {publicRuntimeConfig?.github?.user}
          </span>

          <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
            <FormCheck
              className="form-control-lg px-0 pb-0 mr-1"
              type="checkbox"
              onChange={handlePermissonCheck}
            />
            <span>
              {t("steps.repositories.give-access", { user: publicRuntimeConfig?.github?.user })}
            </span>
          </div>

          <p className="p-small text-gray-70 px-0">
            {t("steps.repositories.you-need-to-accept")}
          </p>
        </div>
      )) || (
        <div className="pt-3">
          <ConnectGithub />
        </div>
      )}
    </Step>
  );
}

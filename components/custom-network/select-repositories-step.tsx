import {FormCheck} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";
import Step from "components/step";

import {useNetworkSettings} from "contexts/network-settings";

import {StepWrapperProps} from "interfaces/stepper";

import {useAppState} from "../../contexts/app-state";

export default function SelectRepositoriesStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation("custom-network");

  const {state} = useAppState();
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
      {(state.currentUser?.login && (
        <div>
          <RepositoriesList repositories={github.repositories} onClick={handleRepositoryCheck} />

          <span className="caption-small text-gray px-0 mt-3">
            {state.Settings?.github?.botUser}
          </span>

          <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
            <FormCheck
              className="form-control-lg px-0 pb-0 mr-1"
              type="checkbox"
              defaultChecked={!!github.botPermission || false}
              onChange={handlePermissonCheck}
            />
            <span>
              {t("steps.repositories.give-access", { user: state.Settings?.github?.botUser })}
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

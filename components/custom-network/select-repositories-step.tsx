import {FormCheck} from "react-bootstrap";

import {useTranslation} from "next-i18next";

import RepositoriesList from "components/custom-network/repositories-list";
import Step from "components/step";

import {useAppState} from "contexts/app-state";
import {useNetworkSettings} from "contexts/network-settings";

import {StepWrapperProps} from "interfaces/stepper";

export default function SelectRepositoriesStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation("custom-network");

  const {state} = useAppState();
  const { details, github, fields } = useNetworkSettings();

  function handleRepositoryCheck(fullName: string) {
    fields.repository.setter(fullName);
  }

  function handlePermissonCheck(e) {
    fields.permission.setter(e.target.checked);
  }

  function changeAllowMergeCheckbox(ele) {
    fields.allowMerge.setter(ele?.target?.checked);
  }

  return (
    <Step
      title={t("steps.repositories.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      <div>
        <RepositoriesList
          repositories={github.repositories}
          networkName={details?.name?.value}
          networkCreator={state.currentUser?.walletAddress}
          onClick={handleRepositoryCheck}
        />

        <span className="caption-small text-gray px-0 mt-3">
          {state.Settings?.github?.botUser}
        </span>

        <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
          <FormCheck
            className="form-control-lg px-0 pb-0 mr-1"
            type="checkbox"
            checked={github.botPermission}
            onChange={handlePermissonCheck}
          />
          <span>
            {t("steps.repositories.give-access", {
              user: state.Settings?.github?.botUser,
            })}
          </span>
        </div>

        <p className="p-small text-gray-70 px-0">
          {t("steps.repositories.you-need-to-accept")}
        </p>

        <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
          <FormCheck
            className="form-control-lg px-0 pb-0 mr-1"
            type="checkbox"
            onChange={changeAllowMergeCheckbox}
            checked={github?.allowMerge}
          />
          <span>{t("allow-merge")}</span>
        </div>
      </div>
    </Step>
  );
}

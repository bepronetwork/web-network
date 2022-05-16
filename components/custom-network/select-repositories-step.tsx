import { FormCheck } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";
import Step from "components/step";

const { publicRuntimeConfig } = getConfig();

export default function SelectRepositoriesStep({
  data,
  step,
  onClick,
  validated,
  githubLogin,
  currentStep,
  handleChangeStep,
  handleCheckPermission
}) {
  const { t } = useTranslation("custom-network");

  function handleCheck(e) {
    handleCheckPermission(e.target.checked);
  }

  return (
    <Step
      title={t("steps.repositories.title")}
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleChangeStep}
    >
      {(githubLogin && (
        <div>
          <RepositoriesList repositories={data.data} onClick={onClick} />

          <span className="caption-small text-gray px-0 mt-3">
            {publicRuntimeConfig?.github?.user}
          </span>

          <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
            <FormCheck
              className="form-control-lg px-0 pb-0 mr-1"
              type="checkbox"
              value={data.permission}
              onChange={handleCheck}
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

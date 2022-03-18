import { FormCheck } from "react-bootstrap";

import ConnectGithub from "components/connect-github";
import RepositoriesList from "components/custom-network/repositories-list";
import Step from "components/step";
import { BEPRO_GITHUB_USER } from "env";
import { useTranslation } from "next-i18next";

export default function SelectRepositoriesStep({
  data,
  step,
  onClick,
  validated,
  githubLogin,
  currentStep,
  handleFinish,
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
      finishLabel={t("steps.repositories.submit-label")}
      handleFinish={handleFinish}
    >
      {(githubLogin && (
        <div>
          <RepositoriesList repositories={data.data} onClick={onClick} />

          <span className="caption-small text-gray px-0 mt-3">
            {BEPRO_GITHUB_USER}
          </span>

          <div className="d-flex align-items-center p-small text-white px-0 m-0 p-0">
            <FormCheck
              className="form-control-lg px-0 pb-0 mr-1"
              type="checkbox"
              value={data.permission}
              onChange={handleCheck}
            />
            <span>
              {t("steps.repositories.give-access", { user: BEPRO_GITHUB_USER })}
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

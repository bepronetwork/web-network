import {useTranslation} from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";

import {useAuthentication} from "x-hooks/use-authentication";

export default function ReAuthorizeGithubModal() {
  const { t } = useTranslation("common");
  
  const { 
    state:{
      show: {
        reAuthorizeGithub
      }
    } 
  } = useAppState();
  const { signInGithub } = useAuthentication();

  return (
    <Modal
      centerTitle
      show={reAuthorizeGithub}
      title={t("modals.reauthorize-github.title")}
    >
      <p className="font-weight-medium text-center">
      {t("modals.reauthorize-github.description")}
      </p>

      <div className="d-flex flex-row justify-content-center">
        <Button onClick={signInGithub}>
          {t("modals.reauthorize-github.button-label")}
        </Button>
      </div>
    </Modal>
  );
}

import { ApplicationContext } from "@contexts/application";
import { changeGithubHandle } from "@contexts/reducers/change-github-handle";
import { BeproService } from "@services/bepro-service";
import useApi from "@x-hooks/use-api";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

import Button from "./button";
import Modal from "./modal";

export default function UserMissingModal({ show }: { show: boolean }) {
  const [isVisible, setVisible] = useState<boolean>(show);
  const {
    dispatch,
    state: { currentAddress, githubLogin },
  } = useContext(ApplicationContext);
  const { removeUser } = useApi();
  const router = useRouter();
  const { t } = useTranslation("common");
  const [error, setError] = useState<boolean>(false);
  const [loadingButton, setLoadingButton] = useState<boolean>(false);

  function handleReconnectAcount() {
    setLoadingButton(true);
    removeUser(currentAddress, githubLogin)
      .then(() => {
        setVisible(false);
        dispatch(changeGithubHandle(""));
        router.push("/account");
      })
      .catch((err) => {
        if (err?.response?.status === 409) {
          setError(true);
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoadingButton(false));
  }

  function handleMyaccountUnlock() {
    setLoadingButton(true);
    router
      .push("/account/my-oracles")
      .then(() => setVisible(false))
      .finally(() => {
        setError(false);
        setLoadingButton(false);
      });
  }

  function changeSetVisible() {
    setVisible(show);
  }

  function loading() {
    if (loadingButton)
      return (
        <Spinner
          size={"xs" as unknown as "sm"}
          className="align-self-center me-2"
          animation="border"
        />
      );
  }

  useEffect(changeSetVisible, [show]);

  return (
    <Modal
      show={isVisible}
      title={t("modals.user-missing-information.title")}
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column">
          <p className="h5 mb-2 text-white">
            {t("modals.user-missing-information.content")}
          </p>
        </div>
        <div className="d-flex justify-content-center">
          {!error ? (
            <Button
              color="primary"
              onClick={handleReconnectAcount}
              disabled={loadingButton}
            >
              {loading()}
              <span>{t("actions.reconnect-account")}</span>
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={handleMyaccountUnlock}
              disabled={loadingButton}
            >
              {loading()}
              <span>{t("actions.my-account-unlock")}</span>
            </Button>
          )}
        </div>
        {error && (
          <div className="mt-3 text-center">
            <p className="caption-small text-danger">
              {t("modals.user-missing-information.error-message")}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

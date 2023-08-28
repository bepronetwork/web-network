import { useState } from "react";

import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import useApi from "x-hooks/use-api";

import RemoveGithubAccountView from "./view";

interface RemoveGithubAccountProps {
  show: boolean;
  githubLogin: string;
  walletAddress: string;
  onCloseClick: () => void;
  onDisconnectGithub: () => void;
}

export default function RemoveGithubAccount({
  show,
  githubLogin,
  walletAddress,
  onCloseClick,
  onDisconnectGithub,
}: RemoveGithubAccountProps) {
  const { t } = useTranslation(["profile", "common"]);
  const [isExecuting, setIsExecuting] = useState(false);

  const { resetUser } = useApi();
  const { dispatch } = useAppState();

  function handleClickRemove() {
    setIsExecuting(true);

    resetUser(walletAddress, githubLogin)
      .then(onDisconnectGithub)
      .then(() => {
        dispatch(toastSuccess(t("modals.remove-github.success")));
        onCloseClick();
      })
      .catch((error) => {
        if (error?.response?.status === 409) {
          const message = {
            PULL_REQUESTS_OPEN: t("modals.remove-github.errors.pull-requests-open"),
          };

          dispatch(toastError(message[error.response.data],
                              t("modals.remove-github.errors.failed-to-remove")));
        } else
          dispatch(toastError(t("modals.remove-github.errors.check-requirements"),
                              t("modals.remove-github.errors.failed-to-remove")));
      })
      .finally(() => setIsExecuting(false));
  }

  return (
    <RemoveGithubAccountView
      show={show}
      isLoading={isExecuting}
      githubLogin={githubLogin}
      walletAddress={walletAddress}
      onCloseClick={onCloseClick}
      onOkClick={handleClickRemove}
    />
  );
}

import { ApplicationContext } from "@contexts/application";
import { changeGithubHandle } from "@contexts/reducers/change-github-handle";
import useApi from "@x-hooks/use-api";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import Button from "./button";
import Modal from "./modal";

export default function UserMissingModal({ show }: { show: boolean }) {
  const [isVisible, setVisible] = useState<boolean>(show);
  const {
    dispatch,
    state: { currentAddress },
  } = useContext(ApplicationContext);
  const { removeUser } = useApi();
  const router = useRouter();
  const { t } = useTranslation("common");

  function handleReconnectAcount() {
    removeUser(currentAddress)
      .then(() => {
        setVisible(false);
        dispatch(changeGithubHandle(""));
        router.push("/account");
      })
      .catch((err) => {
        console.log("err modal user->", err);
      });
  }

  function changeSetVisible() {
    setVisible(show);
  }

  useEffect(changeSetVisible, [show]);

  return (
    <Modal
      show={isVisible}
      title={t("modals.user-missing-information.title")}
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center">
          <p className="h5 mb-2 text-white">
            {t("modals.user-missing-information.content")}
          </p>
        </div>
        <div className="d-flex justify-content-center">
          <Button color="primary" onClick={handleReconnectAcount}>
            <span>{t("actions.reconnect-account")}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

import { ApplicationContext } from "@contexts/application";
import { changeGithubHandle } from "@contexts/reducers/change-github-handle";
import { BeproService } from "@services/bepro-service";
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
    state: { currentAddress, githubLogin },
  } = useContext(ApplicationContext);
  const { removeUser } = useApi();
  const router = useRouter();
  const { t } = useTranslation("common");

  function handleReconnectAcount() {
    test();
    removeUser(currentAddress, githubLogin)
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

  function test() {
    console.log('trest', BeproService.network)
    BeproService.network
      .getOraclesByAddress({ address: currentAddress })
      .then((res) => console.log("res de verdade", res))
      .catch((err) => console.log("err de vdd", err));

/*    BeproService.network
      .redeemIssue({ issueId: 1 })
      .then((res) => console.log("res de verdade 2", res))
      .catch((err) => console.log("err de vdd 2", err));*/

  }

  useEffect(changeSetVisible, [show]);
  useEffect(() => {
    currentAddress && test();
  }, [currentAddress]);

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

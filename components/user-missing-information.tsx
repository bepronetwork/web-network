import { ApplicationContext } from "@contexts/application";
import { addToast } from "@contexts/reducers/add-toast";
import { addTransaction } from "@contexts/reducers/add-transaction";
import { changeGithubHandle } from "@contexts/reducers/change-github-handle";
import { updateTransaction } from "@contexts/reducers/update-transaction";
import { TransactionStatus } from "@interfaces/enums/transaction-status";
import { BeproService } from "@services/bepro-service";
import useApi from "@x-hooks/use-api";
import useTransactions from "@x-hooks/useTransactions";
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
  const [loadingReconnect, setLoadingReconnect] = useState<boolean>(false);
  const [loadingUnlock, setLoadingUnlock] = useState<boolean>(false);
  const txWindow = useTransactions();

  function handleReconnectAcount() {
    setLoadingReconnect(true);
    removeUser(currentAddress, githubLogin)
      .then(() => {
        dispatch(changeGithubHandle(""));
        router
          .push("/account")
          .then(() => setVisible(false))
          .finally(() => setLoadingReconnect(false));
      })
      .catch((err) => {
        if (err?.response?.status === 409) {
          setError(true);
        } else {
          console.error(err);
        }
        setLoadingReconnect(false);
      });
  }

  function handleUnlockAll() {
    BeproService.network
      .getOraclesByAddress(currentAddress)
      .then((value) => {
        setLoadingUnlock(true);

        const tmpTransaction = addTransaction({
          type: 1,
          amount: value,
          currency: t("$oracles"),
        });
        dispatch(tmpTransaction);

        BeproService.network
          .unlock(value, currentAddress)
          .then((answer) => {
            if (answer.status) {
              setError(false);
              dispatch(
                addToast({
                  type: "success",
                  title: t("actions.success"),
                  content: `${t("unlock")} ${value} ${t("$oracles")}`,
                })
              );

              txWindow.updateItem(
                tmpTransaction.payload.id,
                BeproService.parseTransaction(answer, tmpTransaction.payload)
              );
            } else {
              dispatch(
                addToast({
                  type: "danger",
                  title: t("actions.failed"),
                  content: t("actions.failed"),
                })
              );
            }
          })
          .catch((err) => {
            if (err?.message?.search(`User denied`) > -1)
              dispatch(
                updateTransaction({
                  ...(tmpTransaction.payload as any),
                  remove: true,
                })
              );
            else
              dispatch(
                updateTransaction({
                  ...(tmpTransaction.payload as any),
                  status: TransactionStatus.failed,
                })
              );
            console.error(err);
          })
          .finally(() => setLoadingUnlock(false));
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function changeSetVisible() {
    setVisible(show);
  }

  function loading(state: boolean) {
    if (!state) return;
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
          <p className="h5 family-inter mb-2 text-white">
            {t("modals.user-missing-information.content")}
          </p>
          {error && (
            <div className="text-center">
              <p className="family-inter text-danger">
                {t("modals.user-missing-information.error-message")}
              </p>
            </div>
          )}
        </div>
        <div className="d-flex justify-content-center">
          <Button
            color="primary"
            onClick={handleReconnectAcount}
            disabled={loadingReconnect || error}
          >
            {loading(loadingReconnect)}
            <span>{t("actions.reconnect-account")}</span>
          </Button>
          {error && (
            <Button
              color="primary"
              onClick={handleUnlockAll}
              disabled={loadingUnlock}
            >
              {loading(loadingUnlock)}
              <span>
                {t("actions.unlock-all")} {t("$bepro")}
              </span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

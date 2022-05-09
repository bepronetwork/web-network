import React, { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import Account from "components/account";
import IssueListItem from "components/issue-list-item";
import ListIssues from "components/list-issues";
import MarkedRender from "components/MarkedRender";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { toastError } from "contexts/reducers/add-toast";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { IssueData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useNetwork from "x-hooks/use-network";
import usePendingIssue from "x-hooks/use-pending-issue";

export default function MyIssues() {
  const { t } = useTranslation(["common", "bounty"]);

  const [pendingIssues, setPendingIssues] = useState<IssueData[]>([]);

  const { network } = useNetwork();
  const { wallet, user } = useAuthentication();
  const { dispatch } = useContext(ApplicationContext);
  const [pendingIssue, { updatePendingIssue, treatPendingIssue }] =
    usePendingIssue();

  const { getPendingFor } = useApi();

  function getPendingIssues() {
    if (!wallet?.address) return;

    getPendingFor(wallet?.address, undefined, network?.name).then((pending) =>
      setPendingIssues(pending.rows));
  }

  function createPendingIssue() {
    treatPendingIssue().then((result) => {
      if (!result)
        return dispatch(toastError(t("errors.failed-update-bounty")));

      updatePendingIssue(null);
      getPendingIssues();
    });
  }

  useEffect(getPendingIssues, [wallet?.address]);

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {(pendingIssues?.length && (
            <div className="col-md-10">
              <h4 className="mb-4 text-capitalize">{`${t("bounty:status.pending")} ${t("bounty:label_other")}`}</h4>
              {pendingIssues.map((issue) => (
                <IssueListItem
                  issue={issue}
                  xClick={() => updatePendingIssue(issue)}
                />
              ))}
              <hr />
              <Modal
                title={t("modals.set-bounty-draft.title")}
                show={!!pendingIssue}
                centerTitle={true}
                okLabel={t("actions.update")}
                cancelLabel={t("actions.cancel")}
                titlePosition="center"
                className="max-height-body modal-md"
                onOkClick={() => createPendingIssue()}
                onCloseClick={() => updatePendingIssue(null)}
              >
                <h4 className="text-white mb-4">{pendingIssue?.title}</h4>
                <div className="bg-dark-gray p-3 rounded-5 ">
                  <MarkedRender source={pendingIssue?.body} />
                </div>
                <div className="bg-dark-gray w-100 text-center mt-4 rounded-5 py-3">
                  <div className="caption-small fs-smallest text-uppercase text-white">
                    {t("misc.reward")}
                  </div>
                  <h4 className="mb-0 text-uppercase">
                    <span className="text-white">
                      {formatNumberToCurrency(pendingIssue?.amount)}
                    </span>{" "}
                    <span className="text-primary">{t("$bepro")}</span>
                  </h4>
                </div>
              </Modal>
            </div>
          )) ||
            ""}

          <ListIssues creator={user?.login || "not-connected"} />
        </div>
      </div>
    </Account>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "pull-request",
        "connect-wallet-button",
        "custom-network"
      ]))
    }
  };
};

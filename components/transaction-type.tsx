import React from "react";

import { useTranslation } from "next-i18next";

import { TransactionTypes } from "interfaces/enums/transaction-types";

export default function TransactionType({ type }) {
  const { t } = useTranslation("common");
  const TypeMaps = {
    [TransactionTypes.unknown]: t("transactions.types.unkown"),
    [TransactionTypes.lock]: t("transactions.types.lock"),
    [TransactionTypes.unlock]: t("transactions.types.unlock"),
    [TransactionTypes.approveTransactionalERC20Token]: t("transactions.types.approval"),
    [TransactionTypes.openIssue]: t("transactions.types.open-bounty"),
    [TransactionTypes.delegateOracles]: t("transactions.types.delegate"),
    [TransactionTypes.takeBackOracles]: t("transactions.types.removing-delegation"),
    [TransactionTypes.dispute]: t("transactions.types.dispute"),
    [TransactionTypes.proposeMerge]: t("transactions.types.propose"),
    [TransactionTypes.closeIssue]: t("transactions.types.close-bounty"),
    [TransactionTypes.redeemIssue]: t("transactions.types.redeem-bounty"),
    [TransactionTypes.approveSettlerToken]: t("transactions.types.approve-settler"),
    [TransactionTypes.recognizedAsFinish]: t("transactions.types.recognize-finished"),
    [TransactionTypes.createPullRequest]: t("transactions.types.create-pull-request"),
    [TransactionTypes.makePullRequestReady]: t("transactions.types.make-pull-request-ready"),
    [TransactionTypes.updateBountyAmount]: t("transactions.types.update-bounty-amount"),
    [TransactionTypes.cancelPullRequest]: t("transactions.types.cancel-pull-request"),
    [TransactionTypes.refuseProposal]: t("transactions.types.refused-by-owner"),
    [TransactionTypes.deployNetworkV2]: t("transactions.types.deploy-network-v2"),
    [TransactionTypes.setNFTDispatcher]: t("transactions.types.set-dispatcher"),
    [TransactionTypes.addNetworkToRegistry]: t("transactions.types.register-network")
  };

  return (
    <span className="d-block caption-small text-white-50 text-uppercase fs-small">
      {[TypeMaps[type]] || "Missing map"}
    </span>
  );
}

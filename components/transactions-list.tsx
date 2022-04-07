import React, { useContext } from "react";

import { useTranslation } from "next-i18next";

import CenterArrows from "assets/icons/center-arrows";
import ChatBubbles from "assets/icons/chat-bubbles";
import CloseIssueIcon from "assets/icons/close-issue";
import CrossArrow from "assets/icons/cross-arrow";
import DownloadIcon from "assets/icons/download";
import HelpIcon from "assets/icons/help-icon";
import InformationChatBubble from "assets/icons/information-chat-bubble";
import PullRequestIcon from "assets/icons/pull-request-icon";
import RecognizeFinishedIcon from "assets/icons/recognize-finished-icon";
import ReturnArrow from "assets/icons/return-arrow";
import ThumbsUp from "assets/icons/thumbs-up";
import UploadIcon from "assets/icons/upload";

import TransactionStats from "components/transaction-stats";
import TransactionType from "components/transaction-type";

import { ApplicationContext } from "contexts/application";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Transaction } from "interfaces/transaction";

export default function TransactionsList({
  onActiveTransaction = (transaction) => {}
}) {
  const {
    state: { myTransactions }
  } = useContext(ApplicationContext);
  const { t } = useTranslation("common");

  const IconMaps = {
    [TransactionTypes.openIssue]: <InformationChatBubble />,
    [TransactionTypes.createPullRequest]: <PullRequestIcon />,
    [TransactionTypes.makePullRequestReady]: <PullRequestIcon />,
    [TransactionTypes.lock]: <UploadIcon />,
    [TransactionTypes.unlock]: <DownloadIcon />,
    [TransactionTypes.approveTransactionalERC20Token]: <ThumbsUp />,
    [TransactionTypes.delegateOracles]: <CrossArrow />,
    [TransactionTypes.dispute]: <ChatBubbles />,
    [TransactionTypes.redeemIssue]: <ReturnArrow />,
    [TransactionTypes.closeIssue]: <CloseIssueIcon />,
    [TransactionTypes.proposeMerge]: <CenterArrows />,
    [TransactionTypes.approveSettlerToken]: <ThumbsUp />,
    [TransactionTypes.recognizedAsFinish]: <RecognizeFinishedIcon />
  };

  function renderTransactionRow(item: Transaction) {
    const className = "h-100 w-100 px-3 py-2 tx-row mt-2 cursor-pointer";

    return (
      <div
        className={className}
        onClick={() => onActiveTransaction(item)}
        key={item.id}
      >
        <div className="d-flex justify-content-start align-items-center">
          {IconMaps[item.type] || <HelpIcon />}

          <div className="ms-3 me-auto">
            {(item.amount && (
              <span className="caption-large text-white text-uppercase">
                {formatNumberToCurrency(item.amount)} {item.currency}
              </span>
            )) ||
              ""}
            <TransactionType type={item.type} />
          </div>

          <TransactionStats status={item.status} />
        </div>
      </div>
    );
  }

  function emptyTransaction() {
    return (
      <div className="text-center">
        <span className="caption-small text-ligth-gray text-uppercase fs-8 family-Medium">
          {t("transactions.no-transactions")}
        </span>
      </div>
    );
  }

  return (
    <div className="transaction-list w-100">
      <div className="row">
        <div className="col mb-3">
          <h4 className="h4 m-0 text-white">{t("transactions.title_other")}</h4>
        </div>
      </div>
      <div className="overflow-auto tx-container">
        {(!myTransactions || !myTransactions.length) && emptyTransaction()}
        {myTransactions.map(renderTransactionRow)}
      </div>
    </div>
  );
}

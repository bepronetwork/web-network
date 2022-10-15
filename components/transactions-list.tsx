import React, { useContext } from "react";

import BigNumber from "bignumber.js";
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
import RefreshIcon from "assets/icons/refresh-icon";
import ReturnArrow from "assets/icons/return-arrow";
import ThumbsUp from "assets/icons/thumbs-up";
import UploadIcon from "assets/icons/upload";

import Button from "components/button";
import TransactionStats from "components/transaction-stats";
import TransactionType from "components/transaction-type";

import { AppStateContext } from "contexts/app-state";
import { useAuthentication } from "contexts/authentication";

import { formatStringToCurrency } from "helpers/formatNumber";

import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Transaction } from "interfaces/transaction";
import {updateTx} from "../contexts/reducers/change-tx-list";

export default function TransactionsList({
  onActiveTransactionChange
}: {
  onActiveTransactionChange: (transaction: Transaction) => void
}) {
  const {
    dispatch,
    state: { transactions }
  } = useContext(AppStateContext);
  const { t } = useTranslation("common");
  const { wallet } = useAuthentication();

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
    [TransactionTypes.recognizedAsFinish]: <RecognizeFinishedIcon />,
    [TransactionTypes.updateBountyAmount]: <RefreshIcon />,
    [TransactionTypes.cancelPullRequest]: <CloseIssueIcon />,
    [TransactionTypes.refuseProposal]: <CloseIssueIcon />
  };

  function renderTransactionRow(item: Transaction) {
    const className = "h-100 w-100 px-3 py-2 tx-row mt-2 cursor-pointer";

    return (
      <div
        className={className}
        onClick={() => onActiveTransactionChange(item)}
        key={item.id}
      >
        <div className="d-flex justify-content-start align-items-center">
          {IconMaps[item.type] || <HelpIcon />}

          <div className="ms-3 me-auto">
            {(item.amount > 0 && (
              <span className="caption-large text-white text-uppercase">
                {formatStringToCurrency(BigNumber(item.amount).toFixed())} {item.currency}
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

  function clearTransactionsList() {
    localStorage.setItem(`bepro.transactions:${wallet?.address?.toLowerCase()}`, "[]");

    dispatch(updateTx([]));
  }

  return (
    <div className="transaction-list w-100">
      <div className="d-flex flex-row justify-content-between">
        <h4 className="h4 m-0 text-white">{t("transactions.title_other")}</h4>

        { 
          transactions.length &&
          <Button 
            textClass="text-ligth-gray" 
            className="px-0 hover-primary" 
            onClick={clearTransactionsList} 
            transparent
          >
            Clear
            </Button>  || <></>
        }
      </div>
      <div className="overflow-auto tx-container mt-1 pt-2">
        {(!transactions || !transactions.length) && emptyTransaction()}
        {transactions.map(renderTransactionRow)}
      </div>
    </div>
  );
}

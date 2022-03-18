import { useContext } from "react";

import { updateTransaction } from "contexts/reducers/update-transaction";
import { TransactionReceipt } from "bepro-js/dist/interfaces/web3-core";

import { ApplicationContext } from "contexts/application";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import { BeproService } from "services/bepro-service";

import useApi from "./use-api";
import useTransactions from "./useTransactions";

interface IUseBeProDefault {
  onSuccess?: (data?: any) => void;
  onError?: (err?: any) => void;
}

export default function useBepro(props?: IUseBeProDefault) {
  const onSuccess = props?.onSuccess;
  const onError = props?.onError;

  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions }
  } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();

  const { processEvent, waitForClose, waitForRedeem } = useApi();
  const txWindow = useTransactions();

  async function handlerDisputeProposal(
    networkIssueID: number,
    proposalscMergeId: number
  ): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTx = addTransaction(
        { type: TransactionTypes.dispute },
        activeNetwork
      );
      dispatch(disputeTx);
      await BeproService.network
        .disputeMerge(networkIssueID, +proposalscMergeId)
        .then((txInfo) => {
          processEvent("dispute-proposal", txInfo.blockNumber, networkIssueID);
          txWindow.updateItem(
            disputeTx.payload.id,
            BeproService.parseTransaction(txInfo, disputeTx.payload)
          );
          onSuccess?.(txInfo);
          resolve?.(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(
              updateTransaction({ ...(disputeTx.payload as any), remove: true })
            );
          else {
            dispatch(
              updateTransaction({
                ...(disputeTx.payload as any),
                status: TransactionStatus.failed
              })
            );
          }
          onError?.(err);
          reject?.(err);
          console.error("Error creating dispute", err);
        });
    });
  }

  async function handleCloseIssue(
    networkIssueID: number,
    issueId: string,
    proposalscMergeId: number
  ): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTransaction(
        { type: TransactionTypes.closeIssue },
        activeNetwork
      );
      dispatch(closeIssueTx);

      waitForClose(issueId, activeNetwork?.name).then(() => onSuccess?.());

      await BeproService.network
        .closeIssue(networkIssueID, proposalscMergeId)
        .then((txInfo) => {
          // Review: Review processEnvets are working correctly
          processEvent("close-issue", txInfo.blockNumber, networkIssueID).then(
            () => {
              onSuccess?.();
            }
          );
          txWindow.updateItem(
            closeIssueTx.payload.id,
            BeproService.parseTransaction(txInfo, closeIssueTx.payload)
          );
          resolve(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(
              updateTransaction({
                ...(closeIssueTx.payload as any),
                remove: true
              })
            );
          else
            dispatch(
              updateTransaction({
                ...(closeIssueTx.payload as any),
                status: TransactionStatus.failed
              })
            );
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleReedemIssue(
    networkIssueId: number
  ): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTransaction(
        { type: TransactionTypes.redeemIssue },
        activeNetwork
      );
      dispatch(redeemTx);

      waitForRedeem(networkIssueId, activeNetwork?.name).then(() =>
        onSuccess?.()
      );

      await BeproService.network
        .redeemIssue(networkIssueId)
        .then((txInfo) => {
          // Review: Review processEnvets are working correctly
          processEvent("redeem-issue", txInfo.blockNumber, networkIssueId).then(
            () => {
              onSuccess?.();
            }
          );
          txWindow.updateItem(
            redeemTx.payload.id,
            BeproService.parseTransaction(txInfo, redeemTx.payload)
          );
          resolve(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(
              updateTransaction({ ...(redeemTx.payload as any), remove: true })
            );
          else
            dispatch(
              updateTransaction({
                ...(redeemTx.payload as any),
                status: TransactionStatus.failed
              })
            );
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  return {
    handlerDisputeProposal,
    handleCloseIssue,
    handleReedemIssue
  };
}

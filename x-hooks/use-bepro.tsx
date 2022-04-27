import { useContext } from "react";


import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { useTranslation } from "next-i18next";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { TransactionCurrency } from "interfaces/transaction";

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

  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { user }  = useAuthentication()
  const { networkIssue, activeIssue, updateIssue } = useIssue()
  const { t } = useTranslation();

  const { processEvent, waitForClose, waitForRedeem, waitForMerge } = useApi();
  const txWindow = useTransactions();

  async function handlerDisputeProposal(proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTx = addTransaction({ type: TransactionTypes.dispute },
                                       activeNetwork);
      dispatch(disputeTx);
      await BeproService.network
        .disputeMerge(networkIssue._id, +proposalscMergeId)
        .then((txInfo) => {
          processEvent("dispute-proposal", txInfo.blockNumber, networkIssue._id);
          txWindow.updateItem(disputeTx.payload.id,
                              parseTransaction(txInfo, disputeTx.payload));
          onSuccess?.(txInfo);
          resolve?.(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ ...(disputeTx.payload as any), remove: true }));
          else {
            dispatch(updateTransaction({
              ...(disputeTx.payload as any),
              status: TransactionStatus.failed
            }));
          }
          onError?.(err);
          reject?.(err);
          console.error("Error creating dispute", err);
        });
    });
  }

  async function handleCloseIssue(issueId: string,
                                  proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue },
                                          activeNetwork);
      dispatch(closeIssueTx);

      waitForClose(issueId, activeNetwork?.name).then(() => onSuccess?.());

      await BeproService.network
        .closeIssue(networkIssue?._id, proposalscMergeId)
        .then((txInfo) => {
          // Review: Review processEnvets are working correctly
          processEvent("close-issue", txInfo.blockNumber, networkIssue?._id).then(() => {
            onSuccess?.();
          });
          txWindow.updateItem(closeIssueTx.payload.id,
                              parseTransaction(txInfo, closeIssueTx.payload));
          resolve(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as any),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleReedemIssue(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTransaction({ type: TransactionTypes.redeemIssue }, activeNetwork);
      dispatch(redeemTx);
      let tx

      await BeproService.network
        .cancelBounty(networkIssue?.id)
        .then((txInfo) => {
          tx = txInfo;
          // Review: Review processEnvets are working correctly
          return processEvent(`bounty/canceled`, txInfo.blockNumber, networkIssue?.id);
        })
        .then(({data: canceledBounties}) => {
          if (!canceledBounties.find(cid => cid === networkIssue?.cid)) throw new Error('Failed');

          txWindow.updateItem(redeemTx.payload.id, parseTransaction(tx, redeemTx.payload));
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
          onSuccess?.();
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ ...(redeemTx.payload as any), remove: true }));
          else
            dispatch(updateTransaction({
              ...(redeemTx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    })
  }

  async function handleRecognizeAsFinished(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.recognizedAsFinish },
                                activeNetwork);
      dispatch(tx);

      await BeproService.network
        .recognizeAsFinished(networkIssue?._id)
        .then((txInfo) => {
          txWindow.updateItem(tx.payload.id,
                              parseTransaction(txInfo, tx.payload));
          onSuccess?.();
          resolve(txInfo);
        })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as any),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleProposeMerge(prGhId: string,
                                    addresses: string[],
                                    amounts: number[]): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      
      const tx = addTransaction({ type: TransactionTypes.proposeMerge },
                                activeNetwork);
      dispatch(tx);

      waitForMerge(user?.login,
                   networkIssue?._id,
                   prGhId,
                   activeNetwork?.name).then(() => onSuccess?.())
      
      await BeproService.network
                   .proposeIssueMerge(networkIssue?._id,
                                      addresses,
                                      amounts)
                   .then((txInfo) => {
                     processEvent("merge-proposal",
                                  txInfo.blockNumber,
                                  networkIssue?._id,
                                  {pullRequestId: prGhId},
                                  activeNetwork?.name);
             
                     txWindow.updateItem(tx.payload.id,
                                         parseTransaction(txInfo, tx.payload));
                     onSuccess?.();
                     resolve(txInfo);
                   })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as any),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleApproveTransactionalToken(tokenAddress: string = undefined, amount: number): 
    Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      
      const tx = addTransaction({ type: TransactionTypes.approveTransactionalERC20Token },
                                activeNetwork);
      dispatch(tx);

      await BeproService.approveToken(tokenAddress, amount)
      .then((txInfo) => {
        if (!txInfo) throw new Error(t("errors.approve-transaction"));
              
        txWindow.updateItem(tx.payload.id,
                            parseTransaction(txInfo, tx.payload));
        onSuccess?.(txInfo);
        resolve(txInfo);
      })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as any),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleTakeBack(amount: number, 
                                currency: TransactionCurrency, 
                                address: string): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.takeBackOracles,
                                  amount,
                                  currency },
                                activeNetwork);
      dispatch(tx);

      await BeproService.network
                    .unlock(amount, address)
                    .then((txInfo) => {
                      if (!txInfo) throw new Error(t("errors.approve-transaction"));
              
                      txWindow.updateItem(tx.payload.id,
                                          parseTransaction(txInfo, tx.payload));
                      onSuccess?.(txInfo);
                      resolve(txInfo);
                    })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as any),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as any),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleCreatePullRequest(bountyId: number,
                                         originRepo: string,
                                         originBranch: string,
                                         originCID: string,
                                         userRepo: string,
                                         userBranch: string,
                                         cid: number ) {
    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.createPullRequest, }, activeNetwork);
      dispatch(tx);

      await BeproService.network.createPullRequest(bountyId,
                                                   originRepo,
                                                   originBranch,
                                                   originCID,
                                                   userRepo,
                                                   userBranch,
                                                   cid)
                                                   .then(txInfo => {
                                                     txWindow.updateItem(tx.payload.id,
                                                                         parseTransaction(txInfo, tx.payload));
                                                      
                                                     resolve(txInfo);
                                                   })
                                                   .catch(error => {
                                                     if (error?.message?.search("User denied") > -1)
                                                       dispatch(updateTransaction({
                                                      ...(tx.payload as any),
                                                      status: TransactionStatus.rejected
                                                       }));
                                                     else
                                                      dispatch(updateTransaction({
                                                        ...(tx.payload as any),
                                                        status: TransactionStatus.failed
                                                      }));

                                                     onError?.(error);
                                                     reject(error);
                                                   });
    });
  }

  return {
    handlerDisputeProposal,
    handleCloseIssue,
    handleReedemIssue,
    handleRecognizeAsFinished,
    handleProposeMerge,
    handleApproveTransactionalToken,
    handleTakeBack,
    handleCreatePullRequest
  };
}

import { useContext } from "react";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { useTranslation } from "next-i18next";

import { ApplicationContext } from "contexts/application";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BlockTransaction, TransactionCurrency } from "interfaces/transaction";

import useApi from "./use-api";
import useTransactions from "./useTransactions";

interface IUseBeProDefault {
  onSuccess?: (data?: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => void;
  onError?: (err?: { message: string; }) => void;
}

export default function useBepro(props?: IUseBeProDefault) {
  const onSuccess = props?.onSuccess;
  const onError = props?.onError;

  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { networkIssue, activeIssue, updateIssue } = useIssue();
  const { service: DAOService } = useDAO();
  const { t } = useTranslation();

  const { processEvent } = useApi();
  const txWindow = useTransactions();

  async function handlerDisputeProposal(proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTx = addTransaction({ type: TransactionTypes.dispute },
                                       activeNetwork);
      dispatch(disputeTx);
      await DAOService.disputeProposal(+networkIssue.id, +proposalscMergeId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(disputeTx.payload.id,
                              parseTransaction(txInfo, disputeTx.payload));
          onSuccess?.(txInfo);
          resolve?.(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ ...(disputeTx.payload as BlockTransaction), remove: true }));
          else {
            dispatch(updateTransaction({
              ...(disputeTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          }
          onError?.(err);
          reject?.(err);
          console.error("Error creating dispute", err);
        });
    });
  }

  async function handleCloseIssue(bountyId: number,
                                  proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue },
                                          activeNetwork);
      dispatch(closeIssueTx);

      await DAOService.closeBounty(+bountyId, +proposalscMergeId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(closeIssueTx.payload.id,
                              parseTransaction(txInfo, closeIssueTx.payload));
          onSuccess?.();
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as BlockTransaction),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleUpdateBountyAmount(bountyId: number, amount: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.updateBountyAmount }, activeNetwork);

      dispatch(transaction);

      await DAOService.updateBountyAmount(bountyId, amount)
      .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
        txWindow.updateItem(transaction.payload.id,
                            parseTransaction(txInfo, transaction.payload));
        onSuccess?.();
        resolve(txInfo);
      })
      .catch((err: { message: string; }) => {
        if (err?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
            ...(transaction.payload as BlockTransaction),
            remove: true
          }));
        else
          dispatch(updateTransaction({
            ...(transaction.payload as BlockTransaction),
            status: TransactionStatus.failed
          }));
        onError?.(err);
        reject(err);
      });
    });
  }

  async function handleReedemIssue(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTransaction({ type: TransactionTypes.redeemIssue }, activeNetwork);
      dispatch(redeemTx);
      let tx: { blockNumber: number; }

      await DAOService.cancelBounty(networkIssue?.id)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          // Review: Review processEnvets are working correctly
          return processEvent("bounty", 
                              "canceled", 
                              activeNetwork.name, 
                              { fromBlock: txInfo.blockNumber, id: networkIssue?.id });
        })
        .then(({data: canceledBounties}) => {
          if (!canceledBounties.find((cid: string) => cid === networkIssue?.cid)) throw new Error('Failed');

          txWindow.updateItem(redeemTx.payload.id, parseTransaction(tx, redeemTx.payload));
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
          onSuccess?.();
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ ...(redeemTx.payload as BlockTransaction), remove: true }));
          else
            dispatch(updateTransaction({
              ...(redeemTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    })
  }

  async function handleProposeMerge(bountyId: number,
                                    pullRequestId: number,
                                    addresses: string[],
                                    amounts: number[] ): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      
      const tx = addTransaction({ type: TransactionTypes.proposeMerge },
                                activeNetwork);
      dispatch(tx);

      await DAOService.createProposal(bountyId,
                                      pullRequestId,
                                      addresses,
                                      amounts)
                   .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {            
                     txWindow.updateItem(tx.payload.id,
                                         parseTransaction(txInfo, tx.payload));
                     onSuccess?.();
                     resolve(txInfo);
                   })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error closing issue", err);
        });
    });
  }

  async function handleApproveToken(tokenAddress: string, 
                                    amount: number, 
                                    tokenType: "transactional" | "network" = "transactional"):
    Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const type = tokenType === "transactional" ? 
        TransactionTypes.approveTransactionalERC20Token : TransactionTypes.approveSettlerToken ;
      
      const tx = addTransaction({ type },
                                activeNetwork);
      dispatch(tx);

      await DAOService.approveToken(tokenAddress, amount)
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
              ...(tx.payload as BlockTransaction),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          onError?.(err);
          reject(err);
          console.error("Error Approving", err);
        });
    });
  }

  async function handleTakeBack(delegationId: number,
                                amount: number, 
                                currency: TransactionCurrency): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.takeBackOracles,
                                  amount,
                                  currency },
                                activeNetwork);
      dispatch(tx);

      await DAOService.takeBackDelegation(delegationId)
                    .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
                      if (!txInfo) throw new Error(t("errors.approve-transaction"));
              
                      txWindow.updateItem(tx.payload.id,
                                          parseTransaction(txInfo, tx.payload));
                      onSuccess?.(txInfo);
                      resolve(txInfo);
                    })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              remove: true
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
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

      await DAOService.createPullRequest(bountyId,
                                         originRepo,
                                         originBranch,
                                         originCID,
                                         userRepo,
                                         userBranch,
                                         cid)
                                         .then((txInfo: unknown) => {
                                           txWindow.updateItem(tx.payload.id, parseTransaction(txInfo, tx.payload));
                                          
                                           resolve(txInfo);
                                         })
                                        .catch((error: { message: string; }) => {
                                          if (error?.message?.search("User denied") > -1)
                                            dispatch(updateTransaction({
                                          ...(tx.payload as BlockTransaction),
                                          status: TransactionStatus.rejected
                                            }));
                                          else
                                          dispatch(updateTransaction({
                                            ...(tx.payload as BlockTransaction),
                                            status: TransactionStatus.failed
                                          }));

                                          onError?.(error);
                                          reject(error);
                                        });
    });
  }

  async function handleMakePullRequestReady(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.makePullRequestReady, }, activeNetwork);
      dispatch(tx);

      await DAOService.setPullRequestReadyToReview(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        txWindow.updateItem(tx.payload.id,
                            parseTransaction(txInfo, tx.payload));
         
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        if (error?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
         ...(tx.payload as BlockTransaction),
         status: TransactionStatus.rejected
          }));
        else
         dispatch(updateTransaction({
           ...(tx.payload as BlockTransaction),
           status: TransactionStatus.failed
         }));
        console.log(error);
        onError?.(error);
        reject(error);
      });
    });
  }

  async function handleCancelPullRequest(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.cancelPullRequest, }, activeNetwork);
      dispatch(tx);

      await DAOService.cancelPullRequest(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        txWindow.updateItem(tx.payload.id,
                            parseTransaction(txInfo, tx.payload));
         
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        if (error?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
         ...(tx.payload as BlockTransaction),
         status: TransactionStatus.rejected
          }));
        else
         dispatch(updateTransaction({
           ...(tx.payload as BlockTransaction),
           status: TransactionStatus.failed
         }));
        console.log(error);
        onError?.(error);
        reject(error);
      });
    });
  }

  async function handleRefuseByOwner(bountyId: number, proposalId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTransaction({ type: TransactionTypes.refuseProposal, }, activeNetwork);
      dispatch(tx);

      await DAOService.refuseProposal(bountyId, proposalId)
      .then((txInfo: unknown) => {
        txWindow.updateItem(tx.payload.id,
                            parseTransaction(txInfo, tx.payload));
         
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        if (error?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
         ...(tx.payload as BlockTransaction),
         status: TransactionStatus.rejected
          }));
        else
         dispatch(updateTransaction({
           ...(tx.payload as BlockTransaction),
           status: TransactionStatus.failed
         }));
        console.log(error);
        onError?.(error);
        reject(error);
      });
    });
  }

  return {
    handlerDisputeProposal,
    handleCloseIssue,
    handleReedemIssue,
    handleProposeMerge,
    handleApproveToken,
    handleTakeBack,
    handleCreatePullRequest,
    handleMakePullRequestReady,
    handleUpdateBountyAmount,
    handleCancelPullRequest,
    handleRefuseByOwner
  };
}

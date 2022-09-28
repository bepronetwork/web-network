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

import DAO from "services/dao-service";

import { NetworkParameters } from "types/dappkit";

import useApi from "x-hooks/use-api";
import useTransactions from "x-hooks/useTransactions";
import {useSettings} from "../contexts/settings";


export default function useBepro() {
  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { networkIssue, activeIssue, updateIssue } = useIssue();
  const { service: DAOService } = useDAO();
  const { t } = useTranslation("common");
  const { settings } = useSettings();

  const { processEvent } = useApi();
  const txWindow = useTransactions();

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  async function handlerDisputeProposal(proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTx = addTransaction({ type: TransactionTypes.dispute },
                                       activeNetwork);
      dispatch(disputeTx);
      await DAOService.disputeProposal(+networkIssue?.id, +proposalscMergeId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(disputeTx.payload.id,
                              parseTransaction(txInfo, disputeTx.payload));
          resolve?.(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ 
              ...(disputeTx.payload as BlockTransaction), 
              status: TransactionStatus.rejected
            }));
          else {
            dispatch(updateTransaction({
              ...(disputeTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          }
          reject?.(err);
          console.error("Error creating dispute", err);
        });
    });
  }

  async function handleFeeSettings(closeFee: number, cancelFee: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.configFees }, activeNetwork);

      dispatch(transaction);

      await DAOService.updateConfigFees(closeFee, cancelFee)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleCloseIssue(bountyId: number,
                                  proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue },
                                          activeNetwork);
      dispatch(closeIssueTx);

      await DAOService.closeBounty(+bountyId, +proposalscMergeId, settings?.urls?.nft)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(closeIssueTx.payload.id,
                              parseTransaction(txInfo, closeIssueTx.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(closeIssueTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
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
        resolve(txInfo);
      })
      .catch((err: { message: string; }) => {
        if (err?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
            ...(transaction.payload as BlockTransaction),
            status: TransactionStatus.rejected
          }));
        else
          dispatch(updateTransaction({
            ...(transaction.payload as BlockTransaction),
            status: TransactionStatus.failed
          }));
        reject(err);
      });
    });
  }

  async function handleReedemIssue(funding = false): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTransaction({ type: TransactionTypes.redeemIssue }, activeNetwork);
      dispatch(redeemTx);

      let tx: { blockNumber: number; }

      await DAOService.cancelBounty(networkIssue?.id, funding)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          return processEvent("bounty", 
                              "canceled", 
                              activeNetwork.name, 
                              { fromBlock: txInfo.blockNumber, id: networkIssue?.id });
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[networkIssue?.cid]) throw new Error('Failed');

          txWindow.updateItem(redeemTx.payload.id, parseTransaction(tx, redeemTx.payload));
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ 
              ...(redeemTx.payload as BlockTransaction), 
              status: TransactionStatus.rejected 
            }));
          else
            dispatch(updateTransaction({
              ...(redeemTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
          console.error("Error closing issue", err);
        });
    })
  }
  
  async function handleHardCancelBounty(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTransaction({ type: TransactionTypes.redeemIssue }, activeNetwork);
      dispatch(redeemTx);
      let tx: { blockNumber: number; }

      await DAOService.hardCancel(networkIssue?.id)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          return processEvent("bounty", 
                              "canceled", 
                              activeNetwork.name, 
                              { fromBlock: txInfo.blockNumber, id: networkIssue?.id });
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[networkIssue?.cid]) throw new Error('Failed');
          txWindow.updateItem(redeemTx.payload.id, parseTransaction(tx, redeemTx.payload));
          
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({ 
              ...(redeemTx.payload as BlockTransaction), 
              status: TransactionStatus.rejected 
            }));
          else
            dispatch(updateTransaction({
              ...(redeemTx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
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
                     resolve(txInfo);
                   })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
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
        if (!txInfo) throw new Error(t("errors.approve-transaction", {
          currency: networkTokenSymbol
        }));
              
        txWindow.updateItem(tx.payload.id,
                            parseTransaction(txInfo, tx.payload));
        resolve(txInfo);
      })
        .catch((err) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
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
                      if (!txInfo) throw new Error(t("errors.approve-transaction", {
                        currency: networkTokenSymbol
                      }));
              
                      txWindow.updateItem(tx.payload.id,
                                          parseTransaction(txInfo, tx.payload));
                      resolve(txInfo);
                    })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(tx.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
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
        reject(error);
      });
    });
  }

  async function handleDeployNetworkV2(networkToken: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.deployNetworkV2 }, activeNetwork);

      dispatch(transaction);

      await DAOService.deployNetworkV2(networkToken)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(transaction.payload.id, parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleSetDispatcher(nftToken: string, networkAddress: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.setNFTDispatcher }, activeNetwork);

      dispatch(transaction);

      await DAOService.setNFTTokenDispatcher(nftToken, networkAddress)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleAddNetworkToRegistry(networkAddress: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.addNetworkToRegistry }, activeNetwork);

      dispatch(transaction);

      await DAOService.addNetworkToRegistry(networkAddress)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleDeployBountyToken(name: string, symbol: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.deployBountyToken }, activeNetwork);

      dispatch(transaction);

      await DAOService.deployBountyToken(name, symbol)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleChangeNetworkParameter(parameter: NetworkParameters, 
                                              value: number | string, 
                                              networkAddress?: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      let service = DAOService;

      if (networkAddress && networkAddress !== DAOService?.network?.contractAddress) {
        service = new DAO({
          web3Connection: DAOService.web3Connection,
          skipWindowAssignment: true
        });
  
        await service.loadNetwork(networkAddress);
      }

      const transaction = addTransaction({ 
        type: TransactionTypes[`set${parameter[0].toUpperCase() + parameter.slice(1)}`] 
      }, activeNetwork);

      dispatch(transaction);

      await service.setNetworkParameter(parameter, value)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleFundBounty(bountyId: number, amount: number, tokenDecimals?: number) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.fundBounty }, activeNetwork);

      dispatch(transaction);

      await DAOService.fundBounty(bountyId, amount, tokenDecimals)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleRetractFundBounty(bountyId: number, fundingId: number) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.retractFundBounty }, activeNetwork);

      dispatch(transaction);

      await DAOService.retractFundBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  async function handleWithdrawFundRewardBounty(bountyId: number, fundingId: number) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.withdrawFundRewardBounty }, activeNetwork);

      dispatch(transaction);

      await DAOService.withdrawFundRewardBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
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
    handleHardCancelBounty,
    handleCancelPullRequest,
    handleRefuseByOwner,
    handleDeployNetworkV2,
    handleSetDispatcher,
    handleAddNetworkToRegistry,
    handleDeployBountyToken,
    handleChangeNetworkParameter,
    handleFundBounty,
    handleRetractFundBounty,
    handleWithdrawFundRewardBounty,
    handleFeeSettings
  };
}

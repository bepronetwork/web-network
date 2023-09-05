import {TransactionReceipt} from "@taikai/dappkit/dist/src/interfaces/web3-core";
import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import {useAppState} from "contexts/app-state";
import {addTx, updateTx} from "contexts/reducers/change-tx-list";

import {parseTransaction} from "helpers/transactions";

import { NetworkEvents } from "interfaces/enums/events";
import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";
import {SimpleBlockTransactionPayload, TransactionCurrency} from "interfaces/transaction";

import DAO from "services/dao-service";

import {NetworkParameters} from "types/dappkit";

import useApi from "x-hooks/use-api";

const DIVISOR = 1000000;

export default function useBepro() {
  const { t } = useTranslation("common");

  const { processEvent } = useApi();
  const { dispatch, state } = useAppState();

  const networkTokenSymbol = state.Service?.network?.active?.networkToken?.symbol || t("misc.$token");

  const failTx = (err, tx, reject?) => {

    dispatch(updateTx([{
      ...tx.payload[0],
      status: err?.message?.search("User denied") > -1 ? TransactionStatus.rejected : TransactionStatus.failed
    }]));

    reject?.(err);
    console.error("Tx error", err);
  }

  async function handlerDisputeProposal(issueContractId: number,
                                        proposalContractId: number): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const disputeTxAction = addTx([{
        type: TransactionTypes.dispute,
        network: state.Service?.network?.active,
      }] as any);
      dispatch(disputeTxAction);
      await state.Service?.active.disputeProposal(+issueContractId, +proposalContractId)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, disputeTxAction.payload[0] as SimpleBlockTransactionPayload)]))
          resolve?.(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, disputeTxAction, reject);
        });
    });
  }

  async function handleFeeSettings(closeFee: number, cancelFee: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.configFees,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.updateConfigFees(closeFee, cancelFee)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleAmountNetworkCreation(amount: string | number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.amountForNetworkCreation,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.updateAmountNetworkCreation(amount)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleFeeNetworkCreation(amount: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.feeForNetworkCreation,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.updateFeeNetworkCreation(amount)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleCloseIssue(bountyId: number,
                                  proposalContractId: number,
                                  tokenUri: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTx([{
        type: TransactionTypes.closeIssue,
        network: state.Service?.network?.active
      } as any]);
      dispatch(closeIssueTx);

      await state.Service?.active.closeBounty(+bountyId, +proposalContractId, tokenUri)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, closeIssueTx.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, closeIssueTx, reject);
        });
    });
  }

  async function handleUpdateBountyAmount(bountyId: number,
                                          amount: string,
                                          currency: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.updateBountyAmount,
        network: state.Service?.network?.active,
        amount: amount,
        currency: currency
      } as any]);

      dispatch(transaction);

      await state.Service?.active.updateBountyAmount(bountyId, amount)
      .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
        dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]))
        resolve(txInfo);
      })
      .catch((err: { message: string; }) => {
        failTx(err, transaction, reject);
      });
    });
  }

  async function handleReedemIssue( contractId: number, 
                                    issueId: string, 
                                    funding = false): Promise<{ blockNumber: number; } | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTx([{
        type: TransactionTypes.redeemIssue,
        network: state.Service?.network?.active
      } as any]);
      dispatch(redeemTx);

      let tx: { blockNumber: number; }

      await state.Service?.active.cancelBounty(contractId, funding)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          return processEvent(NetworkEvents.BountyCanceled, undefined, {
            fromBlock: txInfo.blockNumber, id: contractId
          });
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[issueId]) throw new Error('Failed');
          dispatch(updateTx([parseTransaction(tx, redeemTx.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(tx);
        })
        .catch((err: { message: string; }) => {
          failTx(err, redeemTx, reject);
        });
    })
  }
  
  async function handleHardCancelBounty(contractId?: number, issueId?: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.redeemIssue,
        network: state.Service?.network?.active
      } as any]);
      dispatch(transaction);
      let tx: { blockNumber: number; }

      await state.Service?.active.hardCancel(contractId)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;

          return processEvent(NetworkEvents.BountyCanceled, undefined, {
            fromBlock: txInfo.blockNumber, 
            id: contractId
          });
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[issueId]) throw new Error('Failed');
          dispatch(updateTx([parseTransaction(tx, transaction.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(canceledBounties);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    })
  }

  async function handleProposeMerge(bountyId: number,
                                    pullRequestId: number,
                                    addresses: string[],
                                    amounts: number[] ): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {

      const tx = addTx([{
        type: TransactionTypes.proposeMerge,
        network: state.Service?.network?.active
      } as any]);
      dispatch(tx);

      await state.Service?.active
        .createProposal(bountyId, pullRequestId, addresses, amounts)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, tx, reject);
        });
    });
  }

  async function handleApproveToken(tokenAddress: string,
                                    amount: string,
                                    tokenType: "transactional" | "network" = "transactional",
                                    currency: string):
    Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const type = tokenType === "transactional" ?
        TransactionTypes.approveTransactionalERC20Token : TransactionTypes.approveSettlerToken ;

      const tx = addTx([{ type, network: state.Service?.network?.active, amount, currency } as any]);
      dispatch(tx);

      await state.Service?.active.approveToken(tokenAddress, amount)
      .then((txInfo) => {
        if (!txInfo)
          throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));

        dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]))
        resolve(txInfo);
      })
        .catch((err) => {
          failTx(err, tx, reject);
        });
    });
  }

  async function handleTakeBack(delegationId: number,
                                amount: string,
                                currency: TransactionCurrency): Promise<{ blockNumber: number; } | Error> {

    return new Promise(async (resolve, reject) => {
      const tx = addTx([{
        type: TransactionTypes.takeBackOracles,
        amount,
        currency,
        network: state.Service?.network?.active
      } as any]);
      dispatch(tx);

      await state.Service?.active
        .takeBackDelegation(delegationId)
        .then((txInfo: { blockNumber: number; }) => {
          if (!txInfo)
            throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));
          dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]))

          processEvent(NetworkEvents.OraclesTransfer, undefined, {
            fromBlock: txInfo.blockNumber
          })
            .catch(console.debug);

          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, tx, reject);
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
      const tx = addTx([{
        type: TransactionTypes.createPullRequest,
        network: state.Service?.network?.active
      } as any]);
      dispatch(tx);

      await state.Service?.active?.createPullRequest(bountyId,
                                                     originRepo,
                                                     originBranch,
                                                     originCID,
                                                     userRepo,
                                                     userBranch,
                                                     cid)
        .then((txInfo: unknown) => {
          dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((error: { message: string; }) => {
          failTx(error, tx, reject);
        });
    });
  }

  async function handleMakePullRequestReady(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx([{
        type: TransactionTypes.makePullRequestReady,
        network: state.Service?.network?.active
      } as any]);
      dispatch(tx);

      await state.Service?.active.setPullRequestReadyToReview(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]));
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleCancelPullRequest(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx([{
        type: TransactionTypes.cancelPullRequest,
        network: state.Service?.network?.active} as any]);

      dispatch(tx);

      await state.Service?.active.cancelPullRequest(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]));
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleRefuseByOwner(bountyId: number, proposalId: number): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const tx = addTx([{
        type: TransactionTypes.refuseProposal,
        network: state.Service?.network?.active
      } as any])
      dispatch(tx);

      await state.Service?.active.refuseProposal(bountyId, proposalId)
      .then((txInfo: TransactionReceipt) => {
        dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]));
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleDeployNetworkV2(networkToken: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.deployNetworkV2,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.deployNetworkV2(networkToken)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleDeployRegistry(erc20: string,
                                      lockAmountForNetworkCreation: string,
                                      treasury: string,
                                      lockFeePercentage: string,
                                      closeFee: string,
                                      cancelFee: string,
                                      bountyToken: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.deployNetworkRegistry,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.deployNetworkRegistry(erc20,
                                                        lockAmountForNetworkCreation,
                                                        treasury,
                                                        BigNumber(lockFeePercentage).multipliedBy(DIVISOR).toString(),
                                                        BigNumber(closeFee).multipliedBy(DIVISOR).toString(),
                                                        BigNumber(cancelFee).multipliedBy(DIVISOR).toString(),
                                                        bountyToken)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleSetDispatcher(nftToken: string, networkAddress: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.setNFTDispatcher,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.setNFTTokenDispatcher(nftToken, networkAddress)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleAddNetworkToRegistry(networkAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.addNetworkToRegistry,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.addNetworkToRegistry(networkAddress)
        .then(txInfo => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch(err => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleDeployBountyToken(name: string, symbol: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.deployBountyToken,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.deployBountyToken(name, symbol)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleChangeNetworkParameter(parameter: NetworkParameters,
                                              value: number | string,
                                              networkAddress?: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      let service = state.Service?.active;

      if (networkAddress && networkAddress !== state.Service?.active?.network?.contractAddress) {
        service = new DAO({
          web3Connection: state.Service?.active.web3Connection,
          skipWindowAssignment: true
        });

        await service.loadNetwork(networkAddress);
      }

      const transaction = addTx([
        { type: TransactionTypes[`set${parameter[0].toUpperCase() + parameter.slice(1)}`] } as any
      ]);

      dispatch(transaction);

      await service.setNetworkParameter(parameter, value)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleFundBounty(bountyId: number, 
                                  amount: string, 
                                  currency?: string, 
                                  tokenDecimals?: number): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.fundBounty,
        amount,
        currency,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.fundBounty(bountyId, amount, tokenDecimals)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleRetractFundBounty( bountyId: number, 
                                          fundingId: number,
                                          amount?: string,
                                          currency?: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.retractFundBounty,
        amount,
        currency,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.retractFundBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleWithdrawFundRewardBounty(bountyId: number,
                                                fundingId: number,
                                                amount?: string,
                                                currency?: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.withdrawFundRewardBounty,
        amount,
        currency,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active.withdrawFundRewardBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleChangeAllowedTokens(addresses: string[], 
                                           isTransactional: boolean, 
                                           add = true): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {

      const transaction = addTx([{
        type: TransactionTypes.changeAllowedTokens,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active[( add ? 'addAllowedTokens' : 'removeAllowedTokens')](addresses, isTransactional)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleCloseNetwork() {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{
        type: TransactionTypes.closeNetwork,
        network: state.Service?.network?.active
      } as any]);

      dispatch(transaction);

      await state.Service?.active?.unlockFromRegistry()
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx([parseTransaction(txInfo, transaction.payload[0] as SimpleBlockTransactionPayload)]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
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
    handleFeeSettings,
    handleDeployRegistry,
    handleChangeAllowedTokens,
    handleCloseNetwork,
    handleFeeNetworkCreation,
    handleAmountNetworkCreation
  };
}

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { useTranslation } from "next-i18next";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import {SimpleBlockTransactionPayload, TransactionCurrency} from "interfaces/transaction";

import DAO from "services/dao-service";

import { NetworkParameters } from "types/dappkit";

import useApi from "x-hooks/use-api";

import { useAppState } from "../contexts/app-state";
import {addTx, updateTx} from "../contexts/reducers/change-tx-list";

export default function useBepro() {
  const { dispatch, state } = useAppState();
  const { t } = useTranslation("common");

  const { processEvent } = useApi();
  // const {getDatabaseBounty, getChainBounty} = useBounty();

  const networkTokenSymbol = state.Service?.network?.networkToken?.symbol || t("misc.$token");

  const failTx = (err, tx, reject?) => {

    dispatch(updateTx([{
      ...tx.payload[0],
      status: err?.message?.search("User denied") > -1 ? TransactionStatus.rejected : TransactionStatus.failed
    }]));

    reject?.(err);
    console.error("Tx error", err);
  }

  async function handlerDisputeProposal(proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTxAction = addTx([{ type: TransactionTypes.dispute }] as any);
      dispatch(disputeTxAction);
      await state.Service?.active.disputeProposal(+state.currentBounty?.chainData?.id, +proposalscMergeId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
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
      const transaction = addTx([{ type: TransactionTypes.configFees } as any]);

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

  async function handleCloseIssue(bountyId: number,
                                  proposalscMergeId: number, 
                                  tokenUri: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const closeIssueTx = addTx([{ type: TransactionTypes.closeIssue } as any]);
      dispatch(closeIssueTx);
      
      await state.Service?.active.closeBounty(+bountyId, +proposalscMergeId, tokenUri)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx([parseTransaction(txInfo, closeIssueTx.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, closeIssueTx, reject);
        });
    });
  }

  async function handleUpdateBountyAmount(bountyId: number, amount: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{ type: TransactionTypes.updateBountyAmount } as any]);

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

  async function handleReedemIssue(funding = false): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTx([{ type: TransactionTypes.redeemIssue } as any]);
      dispatch(redeemTx);

      let tx: { blockNumber: number; }

      await state.Service?.active.cancelBounty(state.currentBounty?.chainData?.id, funding)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          return processEvent("bounty",
            "canceled",
            state.Service?.network?.lastVisited,
            {fromBlock: txInfo.blockNumber, id: state.currentBounty?.chainData?.id});
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[state.currentBounty?.chainData?.cid]) throw new Error('Failed');
          dispatch(updateTx([parseTransaction(tx, redeemTx.payload[0] as SimpleBlockTransactionPayload)]))
          resolve(tx)
          // todo should force these two after action, but we can't have it here or it will fall outside of context
          // getDatabaseBounty(true);
          // getChainBounty(true);
        })
        .catch((err: { message: string; }) => {
          failTx(err, redeemTx, reject);
        });
    })
  }
  
  async function handleHardCancelBounty(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{ type: TransactionTypes.redeemIssue } as any]);
      dispatch(transaction);
      let tx: { blockNumber: number; }

      await state.Service?.active.hardCancel(state.currentBounty?.chainData?.id)
        .then((txInfo: { blockNumber: number; }) => {
          tx = txInfo;
          return processEvent("bounty",
            "canceled",
            state.Service?.network?.lastVisited,
            {fromBlock: txInfo.blockNumber, id: state.currentBounty?.chainData?.id});
        })
        .then((canceledBounties) => {
          if (!canceledBounties?.[state.currentBounty?.chainData?.cid]) throw new Error('Failed');
          dispatch(updateTx([parseTransaction(tx, transaction.payload[0] as SimpleBlockTransactionPayload)]))
          // getChainBounty(true);
          // getDatabaseBounty(true);
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
      
      const tx = addTx([{ type: TransactionTypes.proposeMerge } as any]);
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
                                    tokenType: "transactional" | "network" = "transactional"):
    Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const type = tokenType === "transactional" ? 
        TransactionTypes.approveTransactionalERC20Token : TransactionTypes.approveSettlerToken ;
      
      const tx = addTx([{ type } as any]);
      dispatch(tx);

      console.log(`TX`, tx.payload);

      await state.Service?.active.approveToken(tokenAddress, amount)
      .then((txInfo) => {
        if (!txInfo)
          throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));

        console.log(`TXINFO`, txInfo, tx.payload);

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
                                currency: TransactionCurrency): Promise<TransactionReceipt | Error> {

    return new Promise(async (resolve, reject) => {
      const tx = addTx([{ type: TransactionTypes.takeBackOracles, amount, currency } as any]);
      dispatch(tx);

      await state.Service?.active
        .takeBackDelegation(delegationId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          if (!txInfo)
            throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));
          dispatch(updateTx([parseTransaction(txInfo, tx.payload[0] as SimpleBlockTransactionPayload)]))
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
      const tx = addTx([{ type: TransactionTypes.createPullRequest } as any]);
      dispatch(tx);

      await state.Service?.active
        .createPullRequest(bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid)
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
      const tx = addTx([{ type: TransactionTypes.makePullRequestReady, } as any]);
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
      const tx = addTx([{ type: TransactionTypes.cancelPullRequest, } as any]);
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

  async function handleRefuseByOwner(bountyId: number, proposalId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx([{ type: TransactionTypes.refuseProposal, } as any])
      dispatch(tx);

      await state.Service?.active.refuseProposal(bountyId, proposalId)
      .then((txInfo: unknown) => {
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
      const transaction = addTx([{ type: TransactionTypes.deployNetworkV2 } as any]);

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

  async function handleSetDispatcher(nftToken: string, networkAddress: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{ type: TransactionTypes.setNFTDispatcher } as any]);

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
      const transaction = addTx([{ type: TransactionTypes.addNetworkToRegistry } as any]);

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
      const transaction = addTx([{ type: TransactionTypes.deployBountyToken } as any]);

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

  async function handleFundBounty(bountyId: number, amount: string, currency?: string, tokenDecimals?: number) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{ type: TransactionTypes.fundBounty, amount, currency } as any]);

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

  async function handleRetractFundBounty(bountyId: number, fundingId: number, amount?: string, currency?: string) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([{ type: TransactionTypes.retractFundBounty, amount, currency } as any]);

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
                                                currency?: string) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx([
        {type: TransactionTypes.withdrawFundRewardBounty, amount, currency} as any
      ]);

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

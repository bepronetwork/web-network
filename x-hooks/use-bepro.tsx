import DAO from "services/dao-service";
import useApi from "x-hooks/use-api";
import { useContext } from "react";
import { useTranslation } from "next-i18next";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { parseTransaction } from "helpers/transactions";
import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { TransactionCurrency } from "interfaces/transaction";
import { NetworkParameters } from "types/dappkit";
import {AppStateContext} from "../contexts/app-state";
import {addTx, updateTx} from "../contexts/reducers/change-tx-list";

export default function useBepro() {
  const { dispatch } = useContext(AppStateContext);
  const { activeNetwork } = useNetwork();
  const { networkIssue, activeIssue, updateIssue } = useIssue();
  const { service: DAOService } = useDAO();
  const { t } = useTranslation("common");

  const { processEvent } = useApi();

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  const failTx = (err, tx, reject?) => {

    dispatch(updateTx.update([{
      ...tx.payload[0],
      status: err?.message?.search("User denied") > -1 ? TransactionStatus.rejected : TransactionStatus.failed
    }]));

    reject?.(err);
    console.error("Tx error", err);
  }

  async function handlerDisputeProposal(proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const disputeTx = addTx.update([{ type: TransactionTypes.dispute }] as any);
      dispatch(disputeTx);
      await DAOService.disputeProposal(+networkIssue?.id, +proposalscMergeId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx.update([parseTransaction(txInfo, disputeTx.payload[0])]))
          resolve?.(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, disputeTx, reject);
        });
    });
  }

  async function handleFeeSettings(closeFee: number, cancelFee: number): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.configFees } as any]);

      dispatch(transaction);

      await DAOService.updateConfigFees(closeFee, cancelFee)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]))
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
      const closeIssueTx = addTx.update([{ type: TransactionTypes.closeIssue } as any]);
      dispatch(closeIssueTx);
      
      await DAOService.closeBounty(+bountyId, +proposalscMergeId, tokenUri)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx.update([parseTransaction(txInfo, closeIssueTx.payload[0])]))
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, closeIssueTx, reject);
        });
    });
  }

  async function handleUpdateBountyAmount(bountyId: number, amount: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.updateBountyAmount } as any]);

      dispatch(transaction);

      await DAOService.updateBountyAmount(bountyId, amount)
      .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
        dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]))
        resolve(txInfo);
      })
      .catch((err: { message: string; }) => {
        failTx(err, transaction, reject);
      });
    });
  }

  async function handleReedemIssue(funding = false): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const redeemTx = addTx.update([{ type: TransactionTypes.redeemIssue } as any]);
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
          dispatch(updateTx.update([parseTransaction(tx, redeemTx.payload[0])]))
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
        })
        .catch((err: { message: string; }) => {
          failTx(err, redeemTx, reject);
        });
    })
  }
  
  async function handleHardCancelBounty(): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.redeemIssue } as any]);
      dispatch(transaction);
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
          dispatch(updateTx.update([parseTransaction(tx, transaction.payload[0])]))
          
          updateIssue(activeIssue.repository_id, activeIssue.githubId);
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
      
      const tx = addTx.update([{ type: TransactionTypes.proposeMerge } as any]);
      dispatch(tx);

      await DAOService
        .createProposal(bountyId, pullRequestId, addresses, amounts)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]))
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
      
      const tx = addTx.update([{ type } as any]);
      dispatch(tx);

      await DAOService.approveToken(tokenAddress, amount)
      .then((txInfo) => {
        if (!txInfo)
          throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));

        dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]))
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
      const tx = addTx.update([{ type: TransactionTypes.takeBackOracles, amount, currency } as any]);
      dispatch(tx);

      await DAOService
        .takeBackDelegation(delegationId)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          if (!txInfo)
            throw new Error(t("errors.approve-transaction", {currency: networkTokenSymbol}));
          dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]))
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
      const tx = addTx.update([{ type: TransactionTypes.createPullRequest } as any]);
      dispatch(tx);

      await DAOService
        .createPullRequest(bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid)
        .then((txInfo: unknown) => {
          dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]));
          resolve(txInfo);
        })
        .catch((error: { message: string; }) => {
          failTx(error, tx, reject);
        });
    });
  }

  async function handleMakePullRequestReady(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx.update([{ type: TransactionTypes.makePullRequestReady, } as any]);
      dispatch(tx);

      await DAOService.setPullRequestReadyToReview(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]));         
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleCancelPullRequest(bountyId: number, pullRequestId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx.update([{ type: TransactionTypes.cancelPullRequest, } as any]);
      dispatch(tx);

      await DAOService.cancelPullRequest(bountyId, pullRequestId)
      .then((txInfo: unknown) => {
        dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]));
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleRefuseByOwner(bountyId: number, proposalId: number) {
    return new Promise(async (resolve, reject) => {
      const tx = addTx.update([{ type: TransactionTypes.refuseProposal, } as any])
      dispatch(tx);

      await DAOService.refuseProposal(bountyId, proposalId)
      .then((txInfo: unknown) => {
        dispatch(updateTx.update([parseTransaction(txInfo, tx.payload[0])]));
        resolve(txInfo);
      })
      .catch((error: { message: string; }) => {
        failTx(error, tx, reject);
      });
    });
  }

  async function handleDeployNetworkV2(networkToken: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.deployNetworkV2 } as any]);

      dispatch(transaction);

      await DAOService.deployNetworkV2(networkToken)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleSetDispatcher(nftToken: string, networkAddress: string): Promise<TransactionReceipt | Error> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.setNFTDispatcher } as any]);

      dispatch(transaction);

      await DAOService.setNFTTokenDispatcher(nftToken, networkAddress)
        .then((txInfo: Error | TransactionReceipt | PromiseLike<Error | TransactionReceipt>) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleAddNetworkToRegistry(networkAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.addNetworkToRegistry } as any]);

      dispatch(transaction);

      await DAOService.addNetworkToRegistry(networkAddress)
        .then(txInfo => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
          resolve(txInfo);
        })
        .catch(err => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleDeployBountyToken(name: string, symbol: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.deployBountyToken } as any]);

      dispatch(transaction);

      await DAOService.deployBountyToken(name, symbol)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
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
      let service = DAOService;

      if (networkAddress && networkAddress !== DAOService?.network?.contractAddress) {
        service = new DAO({
          web3Connection: DAOService.web3Connection,
          skipWindowAssignment: true
        });

        await service.loadNetwork(networkAddress);
      }

      const transaction = addTx.update([
        { type: TransactionTypes[`set${parameter[0].toUpperCase() + parameter.slice(1)}`] } as any
      ]);

      dispatch(transaction);

      await service.setNetworkParameter(parameter, value)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleFundBounty(bountyId: number, amount: string, currency?: string, tokenDecimals?: number) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.fundBounty, amount, currency } as any]);

      dispatch(transaction);

      await DAOService.fundBounty(bountyId, amount, tokenDecimals)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          failTx(err, transaction, reject);
        });
    });
  }

  async function handleRetractFundBounty(bountyId: number, fundingId: number, amount?: string, currency?: string) {
    return new Promise(async (resolve, reject) => {
      const transaction = addTx.update([{ type: TransactionTypes.retractFundBounty, amount, currency } as any]);

      dispatch(transaction);

      await DAOService.retractFundBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
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
      const transaction = addTx.update([
        {type: TransactionTypes.withdrawFundRewardBounty, amount, currency} as any
      ]);

      dispatch(transaction);

      await DAOService.withdrawFundRewardBounty(bountyId, fundingId)
        .then((txInfo: TransactionReceipt) => {
          dispatch(updateTx.update([parseTransaction(txInfo, transaction.payload[0])]));
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

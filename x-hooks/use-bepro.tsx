import { useContext } from "react";

import { addTransaction } from "contexts/reducers/add-transaction";
import { ApplicationContext } from "contexts/application";
import { useNetwork } from "contexts/network";
import { BeproService } from "services/bepro-service";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import { updateTransaction } from "@reducers/update-transaction";

import useTransactions from "./useTransactions";
import useApi from "./use-api";
import { TransactionReceipt } from "bepro-js/dist/interfaces/web3-core";

interface IUseBeProDefault{
  onSuccess?: (data?: any)=> void;
  onError?: (err?: any)=> void;
}

export default function useBepro(props?: IUseBeProDefault){
  const onSuccess =  props?.onSuccess
  const onError =  props?.onError

  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions },
  } = useContext(ApplicationContext);
  const {activeNetwork} = useNetwork()

  const {processEvent, waitForClose} = useApi()
  const txWindow = useTransactions();

  async function handlerDisputeProposal(networkIssueID: number, proposalscMergeId: number) {
    const disputeTx = addTransaction({ type: TransactionTypes.dispute },activeNetwork)
    dispatch(disputeTx);

    await BeproService.network
      .disputeMerge(networkIssueID, +proposalscMergeId)
      .then((txInfo) => {
        processEvent(`dispute-proposal`, txInfo.blockNumber, networkIssueID);
        txWindow.updateItem(
          disputeTx.payload.id,
          BeproService.parseTransaction(txInfo, disputeTx.payload)
        );
      })
      .then(()=> onSuccess?.())
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(
            updateTransaction({ ...(disputeTx.payload as any), remove: true })
          );
        else {
          dispatch(
            updateTransaction({
              ...(disputeTx.payload as any),
              status: TransactionStatus.failed,
            })
          );
        }

        onError?.(err);
        console.error("Error creating dispute", err);
      });
  }

  async function handleCloseIssue(networkIssueID: number, issueId: string, proposalscMergeId: number): Promise<TransactionReceipt | Error> {
    const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue }, activeNetwork);
    dispatch(closeIssueTx);

    waitForClose(issueId, activeNetwork?.name)
      .then(()=> onSuccess?.())

    return new Promise(async(resolve, reject)=>{
      await BeproService.network
      .closeIssue(networkIssueID, proposalscMergeId)
      .then((txInfo) => {
        // Review: Review processEnvets are working correctly
        processEvent(`close-issue`, txInfo.blockNumber, networkIssueID).then(()=> {
          onSuccess?.()
        })
        txWindow.updateItem(closeIssueTx.payload.id, BeproService.parseTransaction(txInfo, closeIssueTx.payload));
        resolve(txInfo)
      })
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1) dispatch(updateTransaction({ ...(closeIssueTx.payload as any), remove: true }));
        else dispatch(updateTransaction({...closeIssueTx.payload as any, status: TransactionStatus.failed}));
        onError?.(err)
        reject(err)
        console.error(`Error closing issue`, err);
      });
    })
  }

  return {
    handlerDisputeProposal,
    handleCloseIssue
  };
}

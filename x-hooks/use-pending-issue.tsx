import {BeproService} from '@services/bepro-service';
import {updateTransaction} from '@reducers/update-transaction';
import {Dispatch, SetStateAction, useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {IssueData} from '@interfaces/issue-data';
import useApi from '@x-hooks/use-api';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import useTransactions from '@x-hooks/useTransactions';

interface usePendingIssueActions {
  treatPendingIssue(): Promise<boolean>,
  updatePendingIssue: Dispatch<SetStateAction<IssueData>>
}

type usePendingIssueReturn = [IssueData, usePendingIssueActions];

export default function usePendingIssue<S = IssueData>(): usePendingIssueReturn {
  const [pendingIssue, setPendingIssue] = useState<IssueData>(null);
  const [issueExistsOnSc, setIssueExistsOnSc] = useState<boolean>(false);
  const {dispatch,} = useContext(ApplicationContext);
  const {patchIssueWithScId} = useApi();
  const txWindow = useTransactions();

  async function updateIssueWithCID(repoId, githubId, issueId): Promise<boolean> {
    return patchIssueWithScId(repoId, githubId, issueId)
  }

  async function createPendingIssue(): Promise<{githubId?: string; repoId?: string; issueId}> {
    if (!pendingIssue)
      throw new Error(`No pending issue!`);

    const {githubId, repository_id, amount} = pendingIssue;
    const cid = [repository_id, githubId].join(`/`)
    const tokenAmount = amount.toString();

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount})
    dispatch(openIssueTx);

    return BeproService.network.openIssue(cid, +tokenAmount)
                       .then(async (txInfo) => {
                         txWindow.updateItem(openIssueTx.payload.id, BeproService.parseTransaction(txInfo, openIssueTx.payload));
                         // BeproService.parseTransaction(txInfo, openIssueTx.payload)
                         //             .then(block => dispatch(updateTransaction(block)))
                         const events = await BeproService.network.getOpenIssueEvents({fromBlock: txInfo.blockNumber, address: BeproService.address})

                         return {githubId: pendingIssue.githubId, issueId: events[0]?.returnValues?.id};
                       })
                       .catch(e => {
                         console.error(`Failed to createIssue`, e);
                         if (e?.message?.search(`User denied`) > -1)
                          dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                         else dispatch(updateTransaction({...openIssueTx.payload as any, status: TransactionStatus.failed}));
                         return {} as any;
                       });
  }

  async function pendingIssueExistsOnSC(issue: IssueData): Promise<boolean> {
    return !!(await BeproService.network.getIssueByCID(`${issue.repository_id}/${issue.githubId}`))?.cid
  }

  async function updatePendingIssue(issue: IssueData) {

    let exists = false;
    if (issue)
      exists = await pendingIssueExistsOnSC(issue);

    setIssueExistsOnSc(exists);
    return setPendingIssue(issue);
  }

  async function treatPendingIssue(): Promise<boolean> {
    if (issueExistsOnSc)
      return updateIssueWithCID(pendingIssue.repository_id, pendingIssue.githubId, pendingIssue.issueId || [pendingIssue.repository_id,pendingIssue.githubId].join(`/`));

    return createPendingIssue()
      .then(_issue => {
      if (!_issue.issueId)
        return false;
      return updateIssueWithCID(_issue?.repoId, _issue?.githubId, _issue?.issueId)
    });
  }

  return [
    pendingIssue,
    {
      treatPendingIssue,
      updatePendingIssue,
    }
  ]
}

import {useRouter} from 'next/router';
import {Proposal} from '@interfaces/proposal';
import Link from 'next/link';
import PercentageProgressBar from '@components/percentage-progress-bar';
import ProposalProgressSmall from '@components/proposal-progress-small';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {BeproService} from '@services/bepro-service';
import {updateTransaction} from '@reducers/update-transaction';
import {useContext} from 'react';
import {ApplicationContext} from '@contexts/application';
import Button from './button';
import {TransactionStatus} from '@interfaces/enums/transaction-status';
import useTransactions from '@x-hooks/useTransactions';
import Translation from './translation';
import LockedIcon from '@assets/icons/locked-icon';
import useApi from '@x-hooks/use-api';
import useNetwork from '@x-hooks/use-network';

interface Options {
  proposal: Proposal,
  dbId: string;
  issueId: string;
  amount: number;
  beproStaked: number;
  isFinalized: boolean;
  owner?: string;
  isMerged: boolean;
  isDisputable?: boolean;
  onDispute: (error?: boolean) => void;
}

export default function ProposalItem({
                                       proposal,
                                       dbId,
                                       issueId,
                                       amount,
                                       beproStaked,
                                       isFinalized,
                                       owner,
                                       isMerged = false,
                                       isDisputable = false,
                                       onDispute = () => {}
                                     }: Options) {
  const {dispatch,} = useContext(ApplicationContext);
  const txWindow = useTransactions();
  const { processEvent } = useApi();
  const { getURLWithNetwork } = useNetwork()

  async function handleDispute(mergeId) {
    if (!isDisputable || isFinalized)
      return;

    const disputeTx = addTransaction({type: TransactionTypes.dispute});
    dispatch(disputeTx);

    const issue_id = await BeproService.network.getIssueByCID(issueId).then(({_id}) => _id);
    await BeproService.network.disputeMerge(issue_id, mergeId)
                      .then(txInfo => {
                        processEvent(`dispute-proposal`, txInfo.blockNumber, issue_id);
                        txWindow.updateItem(disputeTx.payload.id, BeproService.parseTransaction(txInfo, disputeTx.payload));
                        // BeproService.parseTransaction(txInfo, disputeTx.payload)
                        //             .then(block => {
                        //               dispatch(updateTransaction(block))
                        //               router.push({pathname: "/proposal", query: { prId: proposal.pullRequestId, mergeId: proposal.scMergeId, dbId, issueId },})
                        //             });
                      })
                      .then(() => onDispute())
                      .catch((err) => {
                        if (err?.message?.search(`User denied`) > -1)
                          dispatch(updateTransaction({...disputeTx.payload as any, remove: true}));
                        else dispatch(updateTransaction({
                                                          ...disputeTx.payload as any,
                                                          status: TransactionStatus.failed
                                                        }));
                        onDispute(true);
                        console.error('Error creating dispute', err)
                      })
  }

  function getColors() {
    if (isFinalized && !proposal.isDisputed && isMerged) {
      return `success`
    }

    if (proposal.isDisputed || (isFinalized && !isMerged)) {
      return `danger`
    }

    return `purple`
  }

  function getLabel() {
    let action = 'dispute'

    if (isFinalized && !proposal.isDisputed && isMerged) {
      action = 'accepted'
    }

    if (proposal.isDisputed || (isFinalized && !isMerged)) {
      action = 'failed'
    }

    return <Translation label={`actions.${action}`} />
  }


  return <>
    <div className="content-list-item proposal" key={`${proposal.pullRequestId}${proposal.scMergeId}`}>
      <Link passHref href={getURLWithNetwork('/proposal', {prId: proposal.pullRequestId, mergeId: proposal.scMergeId, dbId, issueId})}>
        <a className="text-decoration-none">
          <div className="rounded row align-items-center">
            <div
              className={`col-3 caption-small mt-2 text-uppercase text-${getColors() === 'purple' ? 'white' : getColors()}`}>
              <Translation ns="pull-request" label={'abbreviation'} /> #{proposal.pullRequestGithubId} <Translation label={'misc.by'} /> {owner && ` @${owner}`}
            </div>
            <div className="col-5 d-flex justify-content-between mb-2 text-white">
              {proposal.prAmounts.map((value, i) =>
                                        <PercentageProgressBar key={`pg-${i}`}
                                                               textClass={`caption-small p-small text-${getColors()}`}
                                                               pgClass={`bg-${getColors()}`}
                                                               className={i + 1 < proposal.prAmounts.length && `me-2` || ``}
                                                               value={value} total={amount}/>)}
            </div>

            <div className="col-4 d-flex">              
              <div className="col-9 offset-1 text-white">
              <ProposalProgressSmall pgClass={`${getColors()}`}
                                     value={+proposal.disputes}
                                     total={beproStaked}
                                     textClass={`pb-2 text-${getColors()}`}/>
              </div>

              <div className="col-1 offset-1 justify-content-end d-flex">
                <Button color={getColors()}
                        disabled={!isDisputable}
                        outline={!isDisputable} className={`align-self-center mb-2 ms-3`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleDispute(+proposal._id)
                        }}>
                  {!isDisputable && getColors() !== 'success' && <LockedIcon className={`me-2 text-${getColors()}`}/>}
                  <span>{getLabel()}</span>
                </Button>
              </div>

            </div>
          </div>
        </a>
      </Link>
    </div>
  </>
}

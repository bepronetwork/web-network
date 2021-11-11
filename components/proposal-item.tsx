import { useRouter } from 'next/router';
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

interface Options {
  proposal: Proposal,
  dbId: string;
  issueId: string;
  amount: number;
  beproStaked: number;
  isFinished: boolean;
  owner?: string;
  onDispute: (error?: boolean) => void;
}

export default function ProposalItem({proposal, dbId, issueId, amount, beproStaked, isFinished, owner, onDispute = () => {}}: Options) {
  const { dispatch,} = useContext(ApplicationContext);
  const router = useRouter()

  proposal.isDisputed = true;
  isFinished = false;

  async function handleDispute(mergeId) {
    if (proposal.isDisputed)
      return;

    const disputeTx = addTransaction({type: TransactionTypes.dispute});
    dispatch(disputeTx);

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
    await BeproService.network.disputeMerge({issueID: issue_id, mergeID: mergeId,})
                      .then(txInfo => {
                        BeproService.parseTransaction(txInfo, disputeTx.payload)
                                    .then(block => {
                                      dispatch(updateTransaction(block))
                                      router.push({pathname: "/proposal", query: { prId: proposal.pullRequestId, mergeId: proposal.scMergeId, dbId, issueId },})
                                    });
                      })
                      .then(() => onDispute())
                      .catch((err) => {
                        dispatch(updateTransaction({...disputeTx.payload as any, remove: true}));
                        onDispute(true);
                        console.error("Error creating dispute", err)
                      })
  }

  function getColors(){
    if(isFinished && !proposal.isDisputed){
      return `success`
    }

    if(proposal.isDisputed){
      return `danger`
    }

    return `purple`
  }

  function getLabel(){
    if(isFinished && !proposal.isDisputed){
      return `Accepted`
    }

    if(proposal.isDisputed){
      return `Failed`
    }

    return `Dispute`
  }

  
  return <>
    <div className="container-list-item">
      <div className="rounded row align-items-top">
        <div className={`col-4 p-small mt-2 text-uppercase text-${getColors()}`}>
          PR #{proposal.pullRequestGithubId} {owner && `BY ${owner}`}
        </div>
        <div className="col-4 d-flex justify-content-start mb-2">
          {proposal.prAmounts.map((value, i) =>
                                    <PercentageProgressBar textClass={`smallCaption p-small text-${getColors()}`}
                                                            pgClass={`bg-${getColors()}`}
                                                            className={i+1 < proposal.prAmounts.length && `me-2` || ``}
                                                            value={value} total={amount} />)}
        </div>

        <div className="col-4 d-flex justify-content-between">
          <ProposalProgressSmall pgClass={`bg-${getColors()}`}
                                  value={+proposal.disputes}
                                  total={beproStaked}
                                  textClass={`pb-2 text-${getColors()}`}/>
          <div className="col justify-content-end d-flex">
            <Button color={getColors()}
                    disabled={proposal.isDisputed}
                    outline={proposal.isDisputed} className={`align-self-center mb-2 ms-3`}
                    onClick={(ev) => { ev.stopPropagation(); handleDispute(+proposal._id) }}>
                    {getLabel()}
            </Button>
          </div>

        </div>
      </div>
    </div>
    </>
}

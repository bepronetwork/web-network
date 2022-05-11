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
  onDispute: (error?: boolean) => void;
}

export default function ProposalItem({proposal, dbId, issueId, amount, beproStaked, onDispute = () => {}}: Options) {
  const { dispatch,} = useContext(ApplicationContext);

  async function handleDispute(mergeId) {
    const disputeTx = addTransaction({type: TransactionTypes.dispute});
    dispatch(disputeTx);

    if (proposal.isDisputed)
      return;

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);
    await BeproService.network.disputeMerge({issueID: issue_id, mergeID: mergeId,})
                      .then(txInfo => {
                        BeproService.parseTransaction(txInfo, disputeTx.payload)
                                    .then(block => dispatch(updateTransaction(block)));
                      })
                      .then(() => onDispute())
                      .catch((err) => {
                        dispatch(updateTransaction({...disputeTx.payload as any, remove: true}));
                        onDispute(true);
                        console.error("Error creating dispute", err)
                      })
  }

  return <>
    <div className="container-list-item">
      <Link passHref href={{pathname: "/proposal", query: { prId: proposal.pullRequestId, mergeId: proposal.scMergeId, dbId, issueId },}}>
        <a className="text-decoration-none text-white">
          <div className="rounded row align-items-top">
            <div className={`col-4 p-small cursor-pointer mt-2 ${proposal.isDisputed && `text-danger` || ``}`}>
              PR #{proposal.pullRequestGithubId}
            </div>
            <div className="col-4 cursor-pointer d-flex justify-content-start mb-2">
              {proposal.prAmounts.map((value, i) =>
                                        <PercentageProgressBar textClass={`smallCaption p-small ${proposal.isDisputed ? `text-danger` : `color-purple`}`}
                                                               pgClass={`bg-${proposal.isDisputed ? `danger` : `purple`}`}
                                                               className={i+1 < proposal.prAmounts.length && `me-2` || ``}
                                                               value={value} total={amount} />)}
            </div>

            <div className="col-4 d-flex justify-content-between">
              <ProposalProgressSmall pgClass={`bg-${proposal.isDisputed ? `danger` : `purple`}`}
                                     value={+proposal.disputes}
                                     total={beproStaked}
                                     textClass={`pb-2 ${proposal.isDisputed ? `text-danger` : `color-purple`}`}/>
              <Button color={proposal.isDisputed ? `danger` : `purple`}
                      outline={proposal.isDisputed} className={`align-self-center mb-2 ms-3`}
                      onClick={(ev) => { ev.stopPropagation(); handleDispute(+proposal._id) }}>
                {proposal.isDisputed ? `Failed` : `Dispute`}
              </Button>
            </div>
          </div>
        </a>
    </Link>
    </div>
    </>
}

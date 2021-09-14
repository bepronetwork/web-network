import {Proposal} from '@interfaces/proposal';
import Link from 'next/link';
import PercentageProgressBar from '@components/percentage-progress-bar';
import ProposalProgressSmall from '@components/proposal-progress-small';

interface Options {
  proposal: Proposal,
  issueId: string;
  beproStaked: number;
}

export default function ProposalItem({proposal, issueId, beproStaked}: Options) {
  return <>
    <div className="container-list-item">
      <div className="rounded row align-items-top py-3">
          <Link passHref href={{pathname: "/proposal", query: { id: proposal.pullRequestId, issueId: issueId },}}>
            <div className={`col-4 p-small cursor-pointer align-self-center ${proposal.isDisputed && `text-danger` || ``}`}>
              PR #{proposal.pullRequestGithubId}
            </div>
          </Link>
          <Link passHref href={{pathname: "/proposal", query: { id: proposal.pullRequestId, issueId: issueId },}}>
            <div className="col-4 cursor-pointer">
              {proposal.prAmounts.map(value =>
                <PercentageProgressBar textClass={`smallCaption p-small ${proposal.isDisputed ? `text-danger` : `color-purple`}`}
                                       pgClass={`bg-${proposal.isDisputed ? `danger` : `purple`}`}
                                       value={value} total={beproStaked} />)}
            </div>
          </Link>
        <div className="col-4 d-flex justify-content-between align-items-center">
          <ProposalProgressSmall pgClass={`bg-${proposal.isDisputed ? `danger` : `purple`}`}
                                 value={+proposal.disputes}
                                 total={beproStaked}
                                 textClass={proposal.isDisputed ? `text-danger` : `color-purple`}/>
          <button className={`ms-3 btn rounded btn-${proposal.isDisputed ? `outline-danger` : `purple`}`}>
            {proposal.isDisputed ? `Failed` : `Dispute`}
          </button>
        </div>
      </div>
    </div>
    </>
}

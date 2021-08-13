import { toNumber } from "lodash";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import {BeproService} from '@services/bepro-service';

interface Proposal {
  disputes: string;
  prAddresses: [];
  prAmounts: [];
  proposalAddress: string;
  votes: string;
  _id: string;
}

export default function IssueProposals({ numberProposals, issueId, amount }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const handleDispute = async (mergeId) => {
    const dispute = await BeproService.network.disputeMerge({
      issueID: issueId,
      mergeID: mergeId,
    });
    console.log("dispute", dispute);
  };

  useEffect(() => {
    const gets = async () => {
      var arrayProposals = [];
      for (var i = 0; i < numberProposals; i++) {
        await BeproService.network
          .getMergeById({
            issue_id: issueId,
            merge_id: i,
          })
          .then((values: Proposal) => arrayProposals.push(values))
          .catch((err) => console.log("error", err));
      }
      arrayProposals.length === numberProposals && setProposals(arrayProposals);
    };
    gets();
  }, []);
  const handlePercentage = (value: number) => (value * 100) / amount;
  const renderProposals = () => {
    return proposals.map((proposal) => (
      <div className="content-list-item" key={proposal._id}>
        <div className="row align-items-center">
          <div className="col-md-4">
            <p className="p-small mb-0">PR #.. by @....</p>
          </div>
          <div className="col-md-4">
            <div className="content-wrapper p-0 overflow-hidden mb-4">
              <div className="d-flex align-items-center">
                {proposal.prAmounts.map((item, index) => (
                  <div
                    className={`number-block-progress progress-${
                      index + 1
                    } d-flex flex-column align-items-center`}
                    style={{
                      width: `${handlePercentage(toNumber(item))}%`,
                    }}
                    key={index}
                  >
                    <p className="p-small mb-0">
                      {handlePercentage(toNumber(item))}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center justify-content-end">
              <p className="smallCaption color-purple mb-0 mr-2">
                {proposal.disputes} Oracles
              </p>
              <button
                className="btn btn-md btn-purple"
                onClick={() => handleDispute(toNumber(proposal._id))}
              >
                Dispute
              </button>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper mb-4 pb-0">
            <h3 className="smallCaption pb-3">{numberProposals} Proposals</h3>
            {renderProposals()}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

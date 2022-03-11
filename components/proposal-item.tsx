import { Proposal } from "interfaces/proposal";
import Link from "next/link";
import PercentageProgressBar from "components/percentage-progress-bar";
import ProposalProgressSmall from "components/proposal-progress-small";
import { addTransaction } from "@reducers/add-transaction";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BeproService } from "services/bepro-service";
import { updateTransaction } from "@reducers/update-transaction";
import { useContext } from "react";
import { ApplicationContext } from "contexts/application";
import Button from "./button";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import useTransactions from "x-hooks/useTransactions";
import Translation from "./translation";
import LockedIcon from "assets/icons/locked-icon";
import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";
import { useNetwork } from "contexts/network";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import { IssueData } from "interfaces/issue-data";
import { useIssue } from "contexts/issue";

interface Options {
  proposal: Proposal;
  issue: IssueData;
  isFinalized: boolean;
  isDisputable?: boolean;
  onDispute: (error?: boolean) => void;
}

export default function ProposalItem({
  proposal,
  issue,
  isFinalized,
  isDisputable = false,
  onDispute = () => {},
}: Options) {
  const {
    dispatch,
    state: { beproStaked },
  } = useContext(ApplicationContext);
  const txWindow = useTransactions();
  const {networkIssue} = useIssue()
  const { processEvent } = useApi();
  const { getURLWithNetwork } = useNetworkTheme();
  const { activeNetwork } = useNetwork();
  const networkProposals =  networkIssue?.networkProposals?.[proposal?.id] || [];
  
  async function handleDispute(mergeId) {
    if (!isDisputable || isFinalized) return;

    const disputeTx = addTransaction(
      { type: TransactionTypes.dispute },
      activeNetwork
    );
    dispatch(disputeTx);

    await BeproService.network
      .disputeMerge(networkIssue?._id, mergeId)
      .then((txInfo) => {
        processEvent(`dispute-proposal`, txInfo.blockNumber, +networkIssue?._id);
        txWindow.updateItem(
          disputeTx.payload.id,
          BeproService.parseTransaction(txInfo, disputeTx.payload)
        );
      })
      .then(() => onDispute?.())
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(
            updateTransaction({ ...(disputeTx.payload as any), remove: true })
          );
        else
          dispatch(
            updateTransaction({
              ...(disputeTx.payload as any),
              status: TransactionStatus.failed,
            })
          );
        onDispute?.();
        console.error("Error creating dispute", err);
      });
  }

  function getColors() {
    if (isFinalized && !networkProposals?.isDisputed && proposal.isMerged) {
      return `success`;
    }

    if (networkProposals?.isDisputed || (isFinalized && !proposal.isMerged)) {
      return `danger`;
    }

    return `purple`;
  }

  function getLabel() {
    let action = "dispute";

    if (isFinalized && !networkProposals?.isDisputed && proposal.isMerged) {
      action = "accepted";
    }

    if (networkProposals?.isDisputed || (isFinalized && !proposal.isMerged)) {
      action = "failed";
    }

    return <Translation label={`actions.${action}`} />;
  }
  debugger;
  return (
    <>
      <div
        className="content-list-item proposal"
        key={`${proposal?.pullRequestId}${proposal?.scMergeId}`}
      >
        <Link
          passHref
          href={getURLWithNetwork("/proposal", {
            proposalId: proposal?.scMergeId,
          })}
        >
          <a className="text-decoration-none">
            <div className="rounded row align-items-center">
              <div
                className={`col-3 caption-small mt-2 text-uppercase text-${
                  getColors() === "purple" ? "white" : getColors()
                }`}
              >
                <Translation ns="pull-request" label={"abbreviation"} /> #
                {proposal?.githubLogin} <Translation label={"misc.by"} />{" "}
                {proposal?.githubLogin && ` @${proposal?.githubLogin}`}
              </div>
              <div className="col-5 d-flex justify-content-between mb-2 text-white">
                {networkProposals?.prAmounts && networkProposals?.prAmounts?.map((value, i) => (
                  <PercentageProgressBar
                    key={`pg-${i}`}
                    textClass={`caption-small p-small text-${getColors()}`}
                    pgClass={`bg-${getColors()}`}
                    className={
                      (i + 1 < networkProposals?.prAmounts?.length && `me-2`) ||
                      ``
                    }
                    value={value}
                    total={issue.amount}
                  />
                ))}
              </div>

              <div className="col-4 d-flex">
                <div className="col-9 offset-1 text-white">
                  <ProposalProgressSmall
                    pgClass={`${getColors()}`}
                    value={+networkProposals.disputes}
                    total={beproStaked}
                    textClass={`pb-2 text-${getColors()}`}
                  />
                </div>

                <div className="col-1 offset-1 justify-content-end d-flex">
                  <ReadOnlyButtonWrapper>
                    <Button
                      color={getColors()}
                      disabled={!isDisputable}
                      outline={!isDisputable}
                      className={`align-self-center mb-2 ms-3 read-only-button`}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        handleDispute(+proposal.id);
                      }}
                    >
                      {!isDisputable && getColors() !== "success" && (
                        <LockedIcon className={`me-2 text-${getColors()}`} />
                      )}
                      <span>{getLabel()}</span>
                    </Button>
                  </ReadOnlyButtonWrapper>
                </div>
              </div>
            </div>
          </a>
        </Link>
      </div>
    </>
  );
}

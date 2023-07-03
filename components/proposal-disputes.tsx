import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import {CaptionMedium} from "components/bounty/funding-section/minimals.view";

import {useAppState} from "contexts/app-state";

import { formatNumberToNScale } from "helpers/formatNumber";
import {truncateAddress} from "helpers/truncate-address";

export function ProposalDisputes({proposalId}: { proposalId: number}) {
  const {state} = useAppState();
  const { t } = useTranslation(["proposal", "common"]);

  const disputes = state.currentBounty?.data?.disputes || []

  function percentage(value: string, decimals = 2) {
    return BigNumber(value)
      .dividedBy(state.currentUser?.balance?.staked?.toNumber())
      .multipliedBy(100)
      .toFixed(decimals);
  }

  if (
    !state?.currentBounty ||
    !state.currentBounty?.data?.disputes?.length ||
    !proposalId ||
    !disputes.find(dispute => dispute.proposalId === proposalId)
  )
    return null;

  function renderDisputeRow({ address, weight }) {
    const label = (
        <span className="caption-medium text-gray">
          {truncateAddress(address)}
        </span>
      );
  
    return (
        <>
          <div
            key={address}
            className="bg-dark-gray px-3 py-3 d-flex justify-content-between mt-1"
          >
            <div className="col-md-5">{label}</div>
            <div className="col-md-7 mt-1">
              <div className="caption-medium">
                <span className="text-gray">{percentage(weight)}%</span>
                <ArrowRight className="text-gray mx-2" width={10} height={10} />
                <span>
                  {formatNumberToNScale(weight)}{" "}
                  <span className="text-purple">
                    {t("common:$oracles", {
                      token: state.Service?.network?.active?.networkToken?.symbol,
                    })}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </>
    );
  }

  return <>
    <div className="row mt-3">
      <div className="col-md-6">
        <div className="bg-shadow rounded-5">
          <div className="p-3">
            <CaptionMedium text={t('proposal:disputes.title')} color="gray" />
          </div>
          <div className="overflow-auto">
            {disputes?.filter(v => v.proposalId === proposalId).map(renderDisputeRow)}
          </div>
        </div>
      </div>
    </div>
  </>

}
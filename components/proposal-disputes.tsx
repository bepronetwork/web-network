import {useAppState} from "../contexts/app-state";
import {CaptionMedium} from "./bounty/funding-section/minimals";
import {useTranslation} from "next-i18next";
import {truncateAddress} from "../helpers/truncate-address";

export function ProposalDisputes() {
  const {state} = useAppState();
  const { t } = useTranslation(["proposal", "common"]);

  if (!state?.currentBounty || !state.currentBounty?.data?.disputes?.length)
    return;

  function renderDisputeRow({address, weight}, i) {
    const label = <span className="caption-medium text-gray">{truncateAddress(address)}</span>;

    return <>
      <div key={address} className="bg-dark-gray px-3 py-3 d-flex justify-content-between mt-1">
        <div className="col-md-6">{label}</div>
        <div className="col-md-6">{weight} {t('$oracles', {token: state.Service?.network?.networkToken?.symbol})}</div>
      </div>
    </>
  }

  return <>
    <div className="row mt-3">
      <div className="col-md-6">
        <div className="bg-shadow rounded-5">
          <div className="p-3">
            <CaptionMedium text={t('proposal:disputes.title')} color="gray" />
          </div>
          <div className="overflow-auto">
            {state.currentBounty?.data?.disputes?.map(renderDisputeRow)}
          </div>
        </div>
      </div>
    </div>
  </>

}
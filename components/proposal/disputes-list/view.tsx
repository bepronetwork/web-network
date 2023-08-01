import { useTranslation } from "next-i18next";

import ProposalDistributionListItem from "components/proposal/distribution/list/item/view";

import { isLastItem } from "helpers/array";
import { truncateAddress } from "helpers/truncate-address";

import { ProposalDisputes } from "interfaces/proposal";

interface ProposalDisputesViewProps {
  disputes: ProposalDisputes[];
  networkTokenSymbol: string;
  defaultFiat: string;
  calculatePercentage: (value: string) => string;
}

export function ProposalDisputesView({ 
  disputes,
  networkTokenSymbol,
  defaultFiat,
  calculatePercentage,
}: ProposalDisputesViewProps) {
  const { t } = useTranslation(["proposal", "common"]);

  return (
    <div>
      <div className="p-3 bg-gray-900 d-flex align-item-center rounded-top-5">
        <h4 className="text-uppercase caption-medium text-gray">
          {t("proposal:disputes.title")}
        </h4>
      </div>

      <ul className="d-flex flex-column gap-px-1">
        {disputes
          .map((dispute, index, origin) => (
            <ProposalDistributionListItem
              name={truncateAddress(dispute?.address)}
              percentage={calculatePercentage(dispute?.weight?.toString())}
              symbols={[
                networkTokenSymbol,
                defaultFiat,
              ]}
              value={dispute?.weight?.toString()}
              key={`dispute-${dispute?.address}-${dispute?.weight}`}
              className={isLastItem(origin, index) ? "rounded-bottom-5" : ""}
              isNetworkToken
            />
          ))}
      </ul>
    </div>
  );
}

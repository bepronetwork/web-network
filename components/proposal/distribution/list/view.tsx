import { useTranslation } from "next-i18next";

import ProposalDistributionListItem from "components/proposal/distribution/list/item/view";

import { isLastItem } from "helpers/array";
import { truncateAddress } from "helpers/truncate-address";

import { DistributedAmounts } from "interfaces/proposal";

interface ProposalDistributionListViewProps {
  distributedAmounts: DistributedAmounts;
  transactionalTokenSymbol: string;
  fiatSymbol?: string;
  convertValue: (value: number | string) => string;
}

export default function ProposalDistributionListView({
  distributedAmounts,
  transactionalTokenSymbol,
  fiatSymbol,
  convertValue,
}: ProposalDistributionListViewProps) {
  const { t } = useTranslation(["common", "proposal"]);

  const symbolsArray = [transactionalTokenSymbol, fiatSymbol];

  const getItem = (item, name, description) => ({
    ...item,
    name,
    description,
    symbols: symbolsArray,
    convertedValue: convertValue(item?.value),
  });

  const items = [
    ...(distributedAmounts
      ? distributedAmounts.proposals.map((item) =>
          getItem(item,
                  truncateAddress(item?.recipient),
                  t("proposal:merge-modal.contributor-description")))
      : []),
    getItem(distributedAmounts?.mergerAmount,
            t("proposal:merge-modal.proposal-accepter"),
            t("proposal:merge-modal.proposal-accepter-description")),
    getItem(distributedAmounts?.treasuryAmount,
            t("proposal:merge-modal.network-fee"),
            t("proposal:merge-modal.network-fee-description", {
              percentage: distributedAmounts?.treasuryAmount?.percentage,
            })),
    getItem(distributedAmounts?.proposerAmount,
            t("proposal:merge-modal.proposal-creator"),
            t("proposal:merge-modal.proposal-creator-description")),
  ];

  return (
    <div>
      <div className="p-3 bg-gray-900 d-flex align-item-center rounded-top-5">
        <h4 className="text-uppercase caption-medium text-gray">
          {t("proposal:addresses_for_the_distribution")}
        </h4>
      </div>

      <ul className="d-flex flex-column gap-px-1">
        {items.map((item, index, origin) => (
          <ProposalDistributionListItem
            key={`distribution-item-${index}`}
            {...item}
            className={isLastItem(origin, index) ? "rounded-bottom-5" : ""}
          />
        ))}
      </ul>
    </div>
  );
}

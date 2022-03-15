import React from "react";
import { formatNumberToCurrency } from "@helpers/formatNumber";
import { useTranslation } from "next-i18next";
import { truncateAddress } from "@helpers/truncate-address";
import { IDistribuitonPerUser } from "@interfaces/proposal";
import { Currency } from "@interfaces/currency";

interface IProposalListAddressProps {
  usersDistribution: IDistribuitonPerUser[];
  currency?: Currency;
}

export default function ProposalListAddresses({
  usersDistribution,
  currency = `BEPRO`,
}: IProposalListAddressProps) {
  const { t } = useTranslation("proposal");

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5">
        <div className="p-3 text-uppercase text-gray caption-medium">{t('addresses_for_the_distribution')}</div>
        <div className="overflow-auto">
          {usersDistribution?.length > 0 &&
            React.Children.toArray(
              usersDistribution.map((item, index) => (
                <div
                  key={index}
                  className="bg-dark-gray px-3 py-3 d-flex justify-content-between mt-1"
                >
                  <span className="caption-medium text-gray">
                    {truncateAddress(item.address)}
                  </span>
                  <div className="caption-medium color-purple mb-0">
                    <span>{formatNumberToCurrency(item.oracles)}</span>
                    <span className="text-primary">{currency}</span>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}

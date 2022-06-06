import React from "react";

import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { Currency } from "interfaces/currency";
import { DistribuitonPerUser } from "interfaces/proposal";

interface IProposalListAddressProps {
  usersDistribution: DistribuitonPerUser[];
  currency?: Currency;
}

export default function ProposalListAddresses({
  usersDistribution,
  currency = undefined
}: IProposalListAddressProps) {
  const { t } = useTranslation(["proposal", "common"]);

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5">
        <div className="p-3 text-uppercase text-gray caption-medium">
          {t("addresses_for_the_distribution")}
        </div>
        <div className="overflow-auto">
          {usersDistribution?.length > 0 &&
            React.Children.toArray(usersDistribution.map((item, index) => (
                <div
                  key={index}
                  className="bg-dark-gray px-3 py-3 d-flex justify-content-between mt-1"
                >
                  <span className="caption-medium text-gray">
                    {truncateAddress(item?.address)}
                  </span>
                  <div className="caption-medium color-purple mb-0">
                    <span className="text-gray">{item?.percentage}%</span>
                    <ArrowRight
                      className="text-gray mx-2"
                      width={10}
                      height={10}
                    />
                    <span>
                      {formatNumberToCurrency(+item?.distributedAmount, { minimumFractionDigits: 2 })}{" "}
                      <span className="text-primary">${currency || t('common:misc.token')}</span>
                    </span>
                  </div>
                </div>
              )))}
        </div>
      </div>
    </div>
  );
}

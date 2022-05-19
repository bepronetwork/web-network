import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import BountyDistributionItem from "components/bounty-distribution-item";
import Button from "components/button";
import Modal from "components/modal";

import { useNetwork } from "contexts/network";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { formatNumberToCurrency } from "helpers/formatNumber";

import { ProposalExtended } from "interfaces/bounty";

interface amount {
  value: number;
  percentage: number;
}

interface distributedAmounts {
  treasuryAmount: amount;
  mergerAmount: amount;
  proposerAmount: amount;
  proposals: amount[];
}

interface props {
  amountTotal: number;
  tokenSymbol?: string;
  proposal: ProposalExtended;
  onClickMerge: () => void;
  canMerge: boolean;
}

const defaultAmount = {
  value: 0,
  percentage: 0,
};

export default function ProposalMerge({
  amountTotal,
  tokenSymbol,
  proposal,
  onClickMerge,
  canMerge,
}: props) {
  const { t } = useTranslation(["common", "proposal"]);

  const [show, setShow] = useState<boolean>(false);
  const [distributedAmounts, setDistributedAmounts] =
    useState<distributedAmounts>({
      treasuryAmount: defaultAmount,
      mergerAmount: defaultAmount,
      proposerAmount: defaultAmount,
      proposals: [defaultAmount],
    });

  const { activeNetwork } = useNetwork();

  
  async function getDistributedAmounts() {
    if (!proposal?.details) return;
    
    const distributions = await calculateDistributedAmounts(activeNetwork?.treasury,
                                                            activeNetwork?.mergeCreatorFeeShare,
                                                            activeNetwork?.proposerFeeShare,
                                                            amountTotal,
                                                            proposal.details.map(({ percentage }) => percentage));
    setDistributedAmounts(distributions);
  }
    
  useEffect(() => {
    if (!proposal || activeNetwork) return;
    
    getDistributedAmounts();
  }, [proposal, activeNetwork]);

  return (
    <>
      <Button
        className="flex-grow-1"
        textClass="text-uppercase text-white"
        onClick={() => setShow(true)}
        disabled={canMerge}
      >
        {canMerge && <LockedIcon width={12} height={12} className="mr-1" />}

        <span>{t("actions.merge")}</span>
      </Button>
      <Modal
        show={show}
        title={t("proposal:merge-modal.title")}
        titlePosition="center"
        onCloseClick={() => setShow(false)}
        footer={
          <Button
            className="btn-block w-100"
            onClick={onClickMerge}
            disabled={canMerge}
          >
            <span>{t("proposal:merge-modal.confirm-merge")}</span>
          </Button>
        }
      >
        <ul className="mb-0">
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-creator")}
            description={t("proposal:merge-modal.proposal-creator-description")}
            percentage={distributedAmounts.proposerAmount.percentage}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.proposerAmount.value}
          />
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-merger")}
            description={t("proposal:merge-modal.proposal-merger-description")}
            percentage={distributedAmounts.mergerAmount.percentage}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.mergerAmount.value}
          />
          {distributedAmounts?.proposals?.map((item, key) => (
            <BountyDistributionItem
              name={t("proposal:merge-modal.contributor", {
                count: key + 1,
              })}
              description={t("proposal:merge-modal.contributor-description")}
              percentage={item.percentage}
              symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
              amount={item.value}
            />
          ))}
          <BountyDistributionItem
            name={t("proposal:merge-modal.network-fee")}
            description={t("proposal:merge-modal.network-fee-description")}
            percentage={distributedAmounts.treasuryAmount.percentage}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.treasuryAmount.value}
          />
        </ul>
        <div className="rounded-5 py-3 px-3 bg-black text-center mt-4">
          <span className="text-white caption-medium">
            {t("proposal:merge-modal.total")}
          </span>
          <div className=" d-flex justify-content-center cursor-pointer mt-1">
            <span className="text-white caption-large">
              {formatNumberToCurrency(amountTotal)}
            </span>
            <span className="text-primary ms-2 caption-large">
              {tokenSymbol ? tokenSymbol : t("common:misc.token")}
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

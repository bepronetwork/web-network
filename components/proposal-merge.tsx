import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { formatNumberToCurrency } from "helpers/formatNumber";
import { handlePercentage } from "helpers/handlePercentage";

import { ProposalExtended } from "interfaces/bounty";

import useApi from "x-hooks/use-api";

import BountyDistributionItem from "./bounty-distribution-item";
import Button from "./button";
import Modal from "./modal";

interface distributedAmounts {
  treasuryAmount: number;
  mergerAmount: number;
  proposerAmount: number;
  proposals: number[];
}

interface props {
  amountTotal: number,
  tokenSymbol?: string,
  proposal: ProposalExtended,
  mergeBounty: () => void;
  canMerge: boolean
}

export default function ProposalMerge({
  amountTotal,
  tokenSymbol,
  proposal,
  mergeBounty,
  canMerge
}: props ) {
  const [show, setShow] = useState<boolean>(false);
  const [distributedAmounts, setDistributedAmounts] =
    useState<distributedAmounts>({});
  const { getUserOf } = useApi();

  const { t } = useTranslation([
    "common",
    "proposal"
  ]);

  useEffect(() => {
    getDistributedAmounts();
  }, [proposal]);

  async function getDistributedAmounts() {
    if (!proposal?.details) return;

    await Promise.all(proposal.details.map(async (user) => {
      const { address, githubLogin, githubHandle } = await getUserOf(user.recipient);
      return {
          address,
          githubLogin,
          githubHandle,
          percentage: user.percentage,
      };
    }))
      .then(async (data) => {
        const percentages = await calculateDistributedAmounts(amountTotal,
                                                              data.map((value) => value.percentage));

        return percentages;
      })
      .then((data) => setDistributedAmounts(data));
  }

  return (
    <>
      <Button 
              className="flex-grow-1"
              textClass="text-uppercase text-white" 
              onClick={() => setShow(true)} 
              disabled={canMerge}>

                {canMerge && (
                    <LockedIcon width={12} height={12} className="mr-1" />
                  )}

                <span>{t("actions.merge")}</span>
      </Button>
      <Modal
        show={show}
        title={t("proposal:merge-modal.title")}
        titlePosition="center"
        onCloseClick={() => setShow(false)}
        footer={
          <Button className="btn-block w-100" onClick={mergeBounty} disabled={canMerge}>
            <span>{t("proposal:merge-modal.confirm-merge")}</span>
          </Button>
        }
      >
        <ul className="mb-0">
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-creator")}
            description={t("proposal:merge-modal.proposal-creator-description")}
            percentage={handlePercentage(distributedAmounts.proposerAmount,
                                         amountTotal)}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.proposerAmount}
          />
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-merger")}
            description={t("proposal:merge-modal.proposal-merger-description")}
            percentage={handlePercentage(distributedAmounts.mergerAmount,
                                         amountTotal)}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.mergerAmount}
          />
          {distributedAmounts?.proposals?.map((item, key) => (
            <BountyDistributionItem
              name={t("proposal:merge-modal.contributor", {
                count: key + 1
              })}
              description={t("proposal:merge-modal.contributor-description")}
              percentage={handlePercentage(item, amountTotal)}
              symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
              amount={item}
            />
          ))}
          <BountyDistributionItem
            name={t("proposal:merge-modal.network-fee")}
            description={t("proposal:merge-modal.network-fee-description")}
            percentage={handlePercentage(distributedAmounts.treasuryAmount,
                                         amountTotal)}
            symbol={tokenSymbol ? tokenSymbol : t("common:misc.token")}
            amount={distributedAmounts.treasuryAmount}
          />
        </ul>
        <div className="rounded-5 py-3 px-3 bg-black text-center mt-4">
          <span className="text-white caption-medium">{t("proposal:merge-modal.total")}</span>
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

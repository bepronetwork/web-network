import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import BountyDistributionItem from "components/bounty-distribution-item";
import Button from "components/button";
import Modal from "components/modal";

import { useNetwork } from "contexts/network";

import calculateDistributedAmounts from "helpers/calculateDistributedAmounts";
import { formatNumberToCurrency } from "helpers/formatNumber";
import { handleTokenToEurConversion } from "helpers/handleTokenToEurConversion";

import { ProposalExtended } from "interfaces/bounty";
import { TokenInfo } from "interfaces/token";

import { getCoinInfoByContract } from "services/coingecko";

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
  idBounty: string;
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
  idBounty
}: props) {
  const { t } = useTranslation(["common", "proposal"]);

  const [show, setShow] = useState<boolean>(false);
  const [coinInfo, setCoinInfo] = useState<TokenInfo>()
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

    const distributions = calculateDistributedAmounts(activeNetwork?.treasury,
                                                      activeNetwork?.mergeCreatorFeeShare,
                                                      activeNetwork?.proposerFeeShare,
                                                      amountTotal,
                                                      proposal.details.map(({ percentage }) => percentage));
    setDistributedAmounts(distributions);
  }

  async function  getCoinInfo() { 
    await getCoinInfoByContract(activeNetwork?.networkToken?.address).then((tokenInfo) => {
      setCoinInfo(tokenInfo)
    }).catch(error => console.log("getCoinInfo", error));
  }

  function handleConversion(value) {
    return handleTokenToEurConversion(value, coinInfo.prices['eur'])
  }

  function currentTokenSymbol() {
    return tokenSymbol ? tokenSymbol : t("common:misc.token")
  }

  function handleMerge() {
    setShow(false);
    onClickMerge();
  }

  useEffect(() => {
    if (
      !proposal ||
      !activeNetwork?.mergeCreatorFeeShare ||
      !activeNetwork?.treasury
    )
      return;

    getDistributedAmounts();
    getCoinInfo()
  }, [
    proposal,
    activeNetwork?.treasury,
    activeNetwork?.mergeCreatorFeeShare,
    activeNetwork?.proposerFeeShare,
    activeNetwork?.networkToken?.address
  ]);

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
        subTitleComponent={
          <>
          {t("proposal:merge-modal.sub-title")}{" "}
          <span className="text-primary">{t("proposal:merge-modal.bounty", {
            id: idBounty
          })}</span>
        </>
        }
        titlePosition="center"
        onCloseClick={() => setShow(false)}
        footer={
          <>
            <Button
              className="btn-block w-100"
              onClick={handleMerge}
              disabled={canMerge}
            >
              <span>{t("proposal:merge-modal.confirm-merge")}</span>
            </Button>
            <Button
              color="dark-gray"
              className="w-100"
              onClick={() => setShow(false)}
            >
              <span>{t("common:actions.cancel")}</span>
            </Button>
          </>
        }
      >
        <ul className="mb-0 bg-dark-gray rounded-3 px-1 py-2">
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-creator")}
            description={t("proposal:merge-modal.proposal-creator-description")}
            percentage={distributedAmounts.proposerAmount.percentage}
            symbols={[currentTokenSymbol(), 'eur']}
            line={true}
            amounts={[distributedAmounts.proposerAmount.value, 
                      handleConversion(distributedAmounts.proposerAmount.value)]}
          />
          <BountyDistributionItem
            name={t("proposal:merge-modal.proposal-merger")}
            description={t("proposal:merge-modal.proposal-merger-description")}
            percentage={distributedAmounts.mergerAmount.percentage}
            symbols={[currentTokenSymbol(), 'eur']}
            line={true}
            amounts={[distributedAmounts.mergerAmount.value, 
                      handleConversion(distributedAmounts.mergerAmount.value)]}
          />
          {distributedAmounts?.proposals?.map((item, key) => (
            <BountyDistributionItem
              name={t("proposal:merge-modal.contributor", {
                count: key + 1,
              })}
              description={t("proposal:merge-modal.contributor-description")}
              percentage={item.percentage}
              symbols={[currentTokenSymbol(), 'eur']}
              line={true}
              amounts={[item.value, handleConversion(item.value)]}
              key={key}
            />
          ))}
          <BountyDistributionItem
            name={t("proposal:merge-modal.network-fee")}
            description={t("proposal:merge-modal.network-fee-description", {
              percentage: distributedAmounts.treasuryAmount.percentage,
            })}
            percentage={distributedAmounts.treasuryAmount.percentage}
            symbols={[currentTokenSymbol(), 'eur']}
            amounts={[distributedAmounts.treasuryAmount.value, 
                      handleConversion(distributedAmounts.treasuryAmount.value)]}
          />
        </ul>

        <div className="mt-4 border-dashed"></div>

        <div className="d-flex justify-content-between rounded-5 mt-4 py-2 px-3 bg-black">
          <span className="text-white caption-medium pt-3">
            {t("proposal:merge-modal.total")}
          </span>

          <div
            className={`d-flex flex-column cursor-pointer 
          ${handleConversion(amountTotal) > 0 ? "mt-1" : "mt-3"}`}
          >
            <div className="d-flex justify-content-end mb-1">
              <span className="text-white caption-medium">
                {formatNumberToCurrency(amountTotal)}
              </span>
              <span className="text-primary ms-2 caption-medium text-white-40">
                {currentTokenSymbol()}
              </span>
            </div>
            {handleConversion(amountTotal) > 0 && (
            <div className="d-flex justify-content-end">
              <span className="text-white caption-small text-ligth-gray">
                {handleConversion(amountTotal)}</span>
              <span className=" ms-2 caption-small text-ligth-gray">
                EUR
              </span>
            </div>
            )}

          </div>
        </div>
      </Modal>
    </>
  );
}

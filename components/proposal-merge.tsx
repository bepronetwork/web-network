import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import Button from "components/button";
import ContractButton from "components/contract-button";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

import { DistributedAmounts, Proposal } from "interfaces/proposal";
import {TokenInfo} from "interfaces/token";

import {getCoinInfoByContract} from "services/coingecko";

import ProposalDistributionList from "./proposal/distribution/list/view";

interface props {
  amountTotal: BigNumber;
  tokenSymbol?: string;
  proposal: Proposal;
  onClickMerge: () => void;
  canMerge: boolean;
  idBounty: string;
  isMerging?: boolean;
  distributedAmounts: DistributedAmounts;
}

export default function ProposalMerge({
  amountTotal,
  tokenSymbol,
  proposal,
  onClickMerge,
  canMerge,
  idBounty,
  isMerging,
  distributedAmounts
}: props) {
  const { t } = useTranslation(["common", "proposal"]);

  const [show, setShow] = useState<boolean>(false);
  const [coinInfo, setCoinInfo] = useState<TokenInfo>()
  
  const {state} = useAppState();

  const amountTotalConverted = BigNumber(handleConversion(amountTotal));
  const currentTokenSymbol = tokenSymbol ||  t("common:misc.token")

  function handleConversion(value) {
    return BigNumber(value).multipliedBy(coinInfo?.prices[state.Settings?.currency?.defaultFiat]).toFixed(4);
  }

  async function  getCoinInfo() { 
    await getCoinInfoByContract(state.Service?.network?.active?.networkToken?.symbol).then((tokenInfo) => {
      setCoinInfo(tokenInfo)
    }).catch(error => console.debug("getCoinInfo", error));
  }

  function handleMerge() {
    setShow(false);
    onClickMerge();
  }

  useEffect(() => {
    if (!proposal ||!state.Service?.network?.amounts)
      return;

    getCoinInfo()
  }, [proposal,amountTotal]);

  return (
    <>
      <ContractButton
        textClass="text-uppercase text-white"
        onClick={() => setShow(true)}
        disabled={!canMerge || isMerging}
        isLoading={isMerging}
        withLockIcon={!canMerge || isMerging}
      >
        <span>{t("actions.accept")}</span>
      </ContractButton>

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
          <div className="d-flex justify-content-between">
            <Button
              color="dark-gray"
              onClick={() => setShow(false)}
            >
              <span>{t("common:actions.cancel")}</span>
            </Button>

            <Button
              className="btn-block"
              onClick={handleMerge}
              disabled={!canMerge}
            >
              <span>{t("proposal:merge-modal.confirm-merge")}</span>
            </Button>
          </div>
        }
      >
       <ProposalDistributionList
        distributedAmounts={distributedAmounts}
        transactionalTokenSymbol={currentTokenSymbol}
        convertValue={handleConversion}
      />

        <div className="mt-4 border-dashed"></div>

        <div className="d-flex align-items-center justify-content-between rounded-5 mt-4 py-2 px-3 bg-black">
          <span className="text-white caption-medium">
            {t("proposal:merge-modal.total")}
          </span>

          <div className={`d-flex flex-column`}>
            <div className="d-flex justify-content-end mb-1">
              <span className="text-white caption-medium">
                {formatStringToCurrency(amountTotal?.toFixed())}
              </span>
              <span className="text-primary ms-2 caption-medium text-white-40">
                {currentTokenSymbol}
              </span>
            </div>
            {amountTotalConverted?.gt(0) && (
            <div className="d-flex justify-content-end">
              <span className="text-white caption-small text-light-gray">
                {amountTotalConverted?.toFixed()}</span>
              <span className=" ms-2 caption-small text-light-gray">
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

import { useTranslation } from "next-i18next";

import ArrowUpRight from "assets/icons/arrow-up-right";
import ChevronLeftIcon from "assets/icons/chevronleft-icon";

import Button from "components/button";
import CopyButton from "components/common/buttons/copy/controller";
import CustomContainer from "components/custom-container";

import { formatNumberToCurrency } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { Payment } from "interfaces/payments";

import { NetworkPaymentsData } from "types/api";

interface PaymentsNetworkViewProps {
  networkPayments: NetworkPaymentsData;
  totalConverted: number;
  defaultFiat: string;
  handleBack: () => void;
  goToNetwork: () => void;
  goToBounty: (payment: Payment) => () => void;
}

export default function PaymentsNetworkView({
  networkPayments,
  totalConverted,
  defaultFiat,
  handleBack,
  goToNetwork,
  goToBounty,
}: PaymentsNetworkViewProps) {
  const { t } = useTranslation(["common", "profile"]);

  return(
    <CustomContainer>
      <div className="row align-items-center border-bottom border-gray-850 pb-3">
        <div className="col-auto">
          <Button className="p-0 text-gray-200" onClick={handleBack} transparent>
            <ChevronLeftIcon />
          </Button>
        </div>
        <div className="col">
          <h4 className="text-white font-weight-medium text-capitalize">{networkPayments?.name}</h4>
        </div>
      </div>

      <div className="row mt-4 mx-0">
        <Button
          color="gray-850"
          className="gap-1 border-radius-4 border-gray-700 text-gray-200 text-capitalize font-weight-medium not-svg"
          onClick={goToNetwork}
        >
          <span>{t("profile:go-to-network")}</span>
          <ArrowUpRight />
        </Button>
      </div>

      <div className="row align-items-center mx-0 mt-4">
        <div className="col">
        <span className="caption-medium font-weight-medium text-capitalize text-white mr-2">
          {t("profile:total-received")}
        </span>
        </div>

        <div className={`col-auto caption-large font-weight-medium bg-gray-900 py-2 px-3 border 
          border-gray-850 border-radius-4`}>
          <span className="text-white">
            {formatNumberToCurrency(totalConverted)}
          </span>

          <span className="text-gray-600 ml-1">{defaultFiat}</span>
        </div>
      </div>

      <div className="row mx-0 mt-4 gap-3">
      {networkPayments?.payments?.map(payment => 
      <div 
        key={payment?.transactionHash}
        className="row p-2 mx-0 bg-gray-900 border-radius-4 border border-gray-800"
      >
        <div className="col">
          <div className="row align-items-center">
            <div className="col">
              {formatNumberToCurrency(payment?.ammount)}
              <span className="ml-1" style={{color: payment?.issue?.network?.colors?.primary}}>
                {payment?.issue?.transactionalToken?.symbol}
              </span>
            </div>

            <div className="col-auto">
              <Button
                color="gray-800"
                className="text-white"
                onClick={goToBounty(payment)}
                outline
              >
                {t("misc.bounty")} #{payment?.issue?.id}
              </Button>
            </div>
          </div>

          <div className="row align-items-center mt-3">
            <div className="col-auto">
              <span className="font-weight-medium text-gray-500">
                {truncateAddress(payment?.transactionHash)}
              </span>
            </div>
            
            <div className="col-auto px-0">
              <CopyButton
                value={payment?.transactionHash}
              />
            </div>
          </div>
        </div>
      </div>)}
      </div>
    </CustomContainer>
  );
}
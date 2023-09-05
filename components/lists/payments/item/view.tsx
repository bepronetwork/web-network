import Button from "components/button";
import { FlexColumn, FlexRow } from "components/common/flex-box/view";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Network } from "interfaces/network";
import { Payment } from "interfaces/payments";

interface PaymentItemProps extends Payment {
  network: Partial<Network>;
}

export default function PaymentItem({
  ammount,
  issue,
  transactionHash,
  labelBounty,
  labelToken,
  network,
  handleItemClick,
}: PaymentItemProps) {
  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-gray-950",
    "border border-gray-850 border-radius-4 p-3",
  ];

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")} key={transactionHash}>
      <FlexColumn>
        <FlexRow className="caption-large font-weight-medium gap-1 text-uppercase mb-1">
          <span className="text-white">
            {formatNumberToCurrency(ammount)}
          </span>
          <span style={{ color: network?.colors?.primary }}>
            {`${issue?.transactionalToken?.symbol || labelToken}`}
          </span>
        </FlexRow>

        <FlexRow>
          <span className="caption-small text-uppercase text-gray-500">
            {transactionHash}
          </span>
        </FlexRow>
      </FlexColumn>

      <Button
        color="gray-900"
        className="border border-gray-800 font-weight-medium"
        onClick={handleItemClick}
      >
        <span className="text-white text-nowrap">
          {labelBounty} #{issue?.id}
        </span>
      </Button>
    </FlexRow>
  );
}

import Button from "components/button";
import { FlexColumn, FlexRow } from "components/profile/wallet-balance";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

export default function PaymentItem({
  ammount,
  issue,
  transactionHash,
  id,
  labelBounty,
  labelToken,
  handleItemClick,
}: Payment) {
  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-transparent",
    "border border-dark-gray border-radius-8 mb-2 py-3 px-4",
  ];

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")} key={id}>
      <FlexColumn>
        <FlexRow className="caption-large text-uppercase mb-1">
          <span className="text-white mr-1">
            {formatNumberToCurrency(ammount)}
          </span>
          <span className="text-primary">
            {`$${issue?.token?.symbol || labelToken}`}
          </span>
        </FlexRow>

        <FlexRow>
          <span className="caption-small text-uppercase text-gray">
            {transactionHash}
          </span>
        </FlexRow>
      </FlexColumn>

      <Button color="ligth-gray" onClick={() => handleItemClick(issue?.issueId)} outline>
        <span className="text-white text-nowrap">
          {labelBounty} #{issue?.issueId}
        </span>
      </Button>
    </FlexRow>
  );
}

import { useRouter } from "next/router";

import Button from "components/button";
import { FlexColumn, FlexRow } from "components/profile/wallet-balance";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

import useNetworkTheme from "x-hooks/use-network";

export default function PaymentItem({ ammount, issue, transactionHash, id, labelBounty, labelToken } : Payment) {
  const { push } = useRouter();

  const { getURLWithNetwork } = useNetworkTheme();

  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-transparent",
    "border border-dark-gray border-radius-8 mb-2 py-3 px-4"
  ];

  function handleClick() {
    const [repoId, id] = issue.issueId.split('/')

    push(getURLWithNetwork('/bounty', { id, repoId }));
  }

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


      <Button
        color="ligth-gray"
        onClick={handleClick}
        outline
      >
        <span className="text-white text-nowrap">{labelBounty} #{issue?.issueId}</span>
      </Button>
    </FlexRow>
  );
} 
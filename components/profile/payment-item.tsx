import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import { FlexColumn, FlexRow } from "components/profile/wallet-balance";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Payment } from "interfaces/payments";

import useNetworkTheme from "x-hooks/use-network";

export default function PaymentItem({ ammount, issue, transactionHash } : Payment) {
  const { push } = useRouter();
  const { t } = useTranslation(["common", "profile"]);

  const { getURLWithNetwork } = useNetworkTheme();

  const CONTAINER_CLASSES = [
    "justify-content-between align-items-center bg-dark-gray",
    "border border-dark-gray border-radius-8 mb-2 py-3 px-4"
  ];

  function handleClick() {
    const [repoId, id] = issue.issueId.split('/')
    
    push(getURLWithNetwork('/bounty', { id, repoId }));
  }

  return (
    <FlexRow className={CONTAINER_CLASSES.join(" ")} key={transactionHash}>
      <FlexColumn>
        <FlexRow>
          <span className="caption-large text-uppercase text-primary mb-1">
            {`${formatNumberToCurrency(ammount)} $${issue?.token?.symbol || t("misc.$token")}`}
          </span>
        </FlexRow>
      
        <FlexRow>
          <span className="caption-small text-uppercase text-white text-truncate">
            {transactionHash}
          </span>
        </FlexRow>
      </FlexColumn>
        

      <Button
        color="ligth-gray"
        onClick={handleClick}
        outline
      >
        <span className="text-white text-nowrap">issue #{issue?.issueId}</span>
      </Button>
    </FlexRow>
  );
}
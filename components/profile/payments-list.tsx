import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { Payment } from "interfaces/payments";

import useNetworkTheme from "x-hooks/use-network";

import PaymentItem from "./payment-item";

interface PaymentsListProps {
  payments: Payment[];
}

// TODO: Add InfiniteScroll and pagination
export default function PaymentsList({ payments }: PaymentsListProps) {
  const { push } = useRouter();
  const { t } = useTranslation(["common", "profile", "bounty"]);

  const { getURLWithNetwork } = useNetworkTheme();

  function handleItemClick(issueId: string) {
    const [repoId, id] = issueId.split('/')

    push(getURLWithNetwork('/bounty', { id, repoId }));
  }

  if (!payments) return null;
  return (
    <>
      {payments &&
        payments?.map((payment: Payment) =>
          PaymentItem({
            ...payment,
            labelToken: t("misc.$token"),
            labelBounty: t("bounty:label"),
            handleItemClick
          }))}
    </>
  );
}

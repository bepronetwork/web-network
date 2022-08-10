import { useTranslation } from "next-i18next";

import { Payment } from "interfaces/payments";

import PaymentItem from "./payment-item";

interface PaymentsListProps {
  payments: Payment[];
}

// TODO: Add InfiniteScroll and pagination
export default function PaymentsList({ payments }: PaymentsListProps) {
  const { t } = useTranslation(["common", "profile", "bounty"]);

  if (!payments) return null;
  return (
    <>
      {payments &&
        payments?.map((payment: Payment) =>
          PaymentItem({
            ...payment,
            labelToken: t("misc.$token"),
            labelBounty: t("bounty:label"),
          }))}
    </>
  );
}

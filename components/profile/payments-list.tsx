import PaymentItem from "components/profile/payment-item";

import { Payment } from "interfaces/payments";

interface PaymentsListProps {
  payments: Payment[];
}

// TODO: Add InfiniteScroll and pagination
export default function PaymentsList({ payments } : PaymentsListProps) {
  return(
    <>
      {payments && payments.map(PaymentItem)}
    </>
  );
}
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import PaymentsListView from "components/lists/payments/view";

import { Payment } from "interfaces/payments";

import { NetworkPaymentsData } from "types/api";
import { TotalFiatNetworks } from "types/utils";

import { useNetwork } from "x-hooks/use-network";

interface PaymentsListProps {
  payments: NetworkPaymentsData[];
  totalNetworks: TotalFiatNetworks[];
  symbol: string;
}

// TODO: Add InfiniteScroll and pagination
export default function PaymentsList({
  payments,
  totalNetworks,
  symbol
}: PaymentsListProps) {
  const { push } = useRouter();
  const { t } = useTranslation(["common", "profile", "bounty"]);

  const { getURLWithNetwork } = useNetwork();

  const headers = [
    {
      label: t("profile:network-columns.network-name"),
      align: "left px-2",
    },
    {
      label: t("profile:network-columns.total-received"),
      align: "center",
    },
    {
      label: t("profile:network-columns.network-link"),
      align: "center",
    },
  ];

  function onPaymentRedirect(network: NetworkPaymentsData, payment: Payment) {
    const id = payment.issue.id;

    return () => 
      push(getURLWithNetwork("/bounty/[id]", { id, chain: network?.chain?.chainShortName, network: network?.name }));
  }

  function onNetworkRedirect(network: NetworkPaymentsData) {
    return () => push(getURLWithNetwork("/", { chain: network?.chain?.chainShortName, network: network?.name }));
  }

  function handleAmount(network: NetworkPaymentsData) {
    return totalNetworks
      .filter((n) => n?.networkId === network?.id)
      .reduce((acc, token) => acc + token.value * (token.price || 0), 0);
  }

  return (
    <PaymentsListView
      payments={payments}
      symbol={symbol}
      headers={headers}
      convertNetworkValue={handleAmount}
      onNetworkRedirect={onNetworkRedirect}
      onPaymentRedirect={onPaymentRedirect}
    />
  );
}
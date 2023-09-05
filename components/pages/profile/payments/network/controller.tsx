import { useRouter } from "next/router";

import PaymentsNetworkView from "components/pages/profile/payments/network/view";

import { useAppState } from "contexts/app-state";

import { NetworkPaymentsData } from "types/api";

import { useNetwork } from "x-hooks/use-network";

interface PaymentsNetworkProps {
  networkPayments: NetworkPaymentsData;
  totalConverted: number;
  defaultFiat: string;
}

export default function PaymentsNetwork({
  networkPayments,
  totalConverted,
  defaultFiat,
}: PaymentsNetworkProps) {
  const { push } = useRouter();

  const { state } = useAppState();
  const { goToProfilePage, getURLWithNetwork } = useNetwork();

  function handleBack() {
    goToProfilePage("payments", {
      networkName: "",
      networkChain: "",
      wallet: state.currentUser?.walletAddress
    });
  }

  function redirectToNetwork(id = undefined) {
    const isBountyRedirect = !!id;

    const path = isBountyRedirect ? "/bounty/[id]" : "/bounties";

    push(getURLWithNetwork(path, {
      network: networkPayments?.name,
      chain: networkPayments?.chain?.chainShortName,
      ... isBountyRedirect ? { id } : {}
    }));
  }

  function goToNetwork() {
    redirectToNetwork();
  }

  function goToBounty(payment) {
    return () => {
      if (!payment?.issue?.id) return;

      redirectToNetwork(payment?.issue?.id);
    };
  }

  return(
    <PaymentsNetworkView
      networkPayments={networkPayments}
      totalConverted={totalConverted}
      defaultFiat={defaultFiat}
      handleBack={handleBack}
      goToNetwork={goToNetwork}
      goToBounty={goToBounty}
    />
  );
}
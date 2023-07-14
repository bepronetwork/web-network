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

  function redirectToNetwork(id = undefined, repoId = undefined) {
    const isBountyRedirect = !!id && !!repoId;
    const path = isBountyRedirect ? "/bounty" : "/bounties";

    push(getURLWithNetwork(path, {
      network: networkPayments?.name,
      chain: networkPayments?.chain?.chainShortName,
      ... isBountyRedirect ? { id, repoId } : {}
    }));
  }

  function goToNetwork() {
    redirectToNetwork();
  }

  function goToBounty(payment) {
    return () => {
      if (!payment?.issue?.issueId) return;

      const [repoId, id] = payment.issue.issueId.split("/");

      redirectToNetwork(id, repoId);
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
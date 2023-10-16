import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";
import { useRouter } from "next/router";

import PaymentsMulti from "components/pages/profile/payments/multi/controller";
import PaymentsNetwork from "components/pages/profile/payments/network/controller";

import { useAppState } from "contexts/app-state";

import { getPricesAndConvert } from "helpers/tokens";

import { PaymentsPageProps } from "types/pages";
import { TotalFiatNetworks } from "types/utils";

export default function PaymentsPage({ 
  payments,
  chains,
}: PaymentsPageProps) {
  const router = useRouter();

  const [totalFiat, setTotalFiat] = useState(0);
  const [hasNoConvertedToken, setHasNoConvertedToken] = useState(false);
  const [totalFiatNetworks, setTotalFiatNetworks] = useState<TotalFiatNetworks[]>([]);
  
  const { state } = useAppState();

  const isNetworkPayments = !!router?.query?.networkName && !!payments?.length;
  const fiatSymbol = state?.Settings?.currency?.defaultFiat?.toUpperCase();

  useEffect(() => {
    if (!payments?.length) {
      setTotalFiatNetworks([]);
      setTotalFiat(0);
      return;
    }

    const convertableItems = payments.flatMap(({ id, payments }) => payments.map(payment => ({
      tokenAddress: payment?.issue?.transactionalToken?.address,
      networkId: id,
      value: BigNumber(payment.ammount),
      token: payment.issue.transactionalToken
    })));

    getPricesAndConvert<TotalFiatNetworks>(convertableItems, state?.Settings?.currency?.defaultFiat)
      .then(({ converted, noConverted, totalConverted }) => {      
        setTotalFiatNetworks(converted);
        setTotalFiat(totalConverted.toNumber());
        setHasNoConvertedToken(!!noConverted.length);
      });
  }, [payments]);

  if (isNetworkPayments)
    return(
      <PaymentsNetwork
        networkPayments={payments[0]}
        totalConverted={totalFiat}
        defaultFiat={fiatSymbol}
      />
    );

  return(
    <PaymentsMulti
      payments={payments}
      chains={chains}
      fiatSymbol={fiatSymbol}
      totalFiat={totalFiat}
      totalFiatNetworks={totalFiatNetworks}
      hasNoConvertedToken={hasNoConvertedToken}
    />
  );
}

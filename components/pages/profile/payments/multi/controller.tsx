import PaymentsMultiView from "components/pages/profile/payments/multi/view";

import { PaymentsPageProps } from "types/pages";
import { TotalFiatNetworks } from "types/utils";

interface PaymentsPageViewProps extends PaymentsPageProps {
  fiatSymbol: string;
  totalFiat: number;
  totalFiatNetworks: TotalFiatNetworks[];
  hasNoConvertedToken?: boolean;
}

export default function PaymentsMulti({
  payments,
  chains,
  fiatSymbol,
  totalFiat,
  totalFiatNetworks,
  hasNoConvertedToken,
}: PaymentsPageViewProps) {
  const intervalOptions = [7, 15, 30];

  return(
    <PaymentsMultiView
      payments={payments}
      chains={chains}
      fiatSymbol={fiatSymbol}
      totalFiat={totalFiat}
      intervals={intervalOptions}
      defaultInterval={intervalOptions[0]}
      totalFiatNetworks={totalFiatNetworks}
      hasNoConvertedToken={hasNoConvertedToken}
    />
  );
}
import { useState } from "react";

import BigNumber from "bignumber.js";

import { Currency } from "interfaces/currency";

import PriceConversorView from "./view";

interface IPriceConversorProps {
  currentValue: BigNumber;
  currency: Currency | string;
}

export default function PriceConversor({
  currentValue,
  currency,
}: IPriceConversorProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  return (
    <PriceConversorView
      currentValue={currentValue}
      currency={currency}
      isVisible={isVisible}
      handleIsVisible={setIsVisible}
    />
  );
}

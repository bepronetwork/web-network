import { useState } from "react";

import BigNumber from "bignumber.js";
import getConfig from "next/config";

import PriceConversorModal from "components/price-conversor-modal";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Currency } from "interfaces/currency";

import useBreakPoint from "x-hooks/use-breakpoint";

interface IPriceConversorProps {
  currentValue: BigNumber;
  currency: Currency | string;
}

const { publicRuntimeConfig } = getConfig();

export default function PriceConversor({
  currentValue,
  currency
}: IPriceConversorProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const { isDesktopView } = useBreakPoint();

  return (
    <>
    <div onClick={()=> setIsVisible(publicRuntimeConfig?.enableCoinGecko && true)}
        className={
          `${(!isDesktopView || !publicRuntimeConfig?.enableCoinGecko) && 
            'read-only-button-mobile'} price-conversor rounded-5 py-2 px-3 bg-black 
                   d-flex align-items-center justify-content-around cursor-pointer`}>
      <span className="text-white caption-large">
        {formatStringToCurrency(currentValue?.toFixed() || "0")}
      </span>
      <span className="text-white-30 ms-2">{currency}</span>
    </div>
    <PriceConversorModal value={currentValue} show={isVisible} onClose={() => setIsVisible(false)}/>
    </>
  );
}

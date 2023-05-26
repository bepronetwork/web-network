import { useState } from "react";
import { isMobile } from "react-device-detect";

import getConfig from "next/config";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Currency } from "interfaces/currency";

import PriceConversorModal from "./price-conversor-modal";

interface IPriceConversorProps {
  currentValue: string;
  currency: Currency | string;
}

export default function PriceConversor({
  currentValue,
  currency
}: IPriceConversorProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const {publicRuntimeConfig} = getConfig();

  return (
    <>
    <div onClick={()=> setIsVisible(publicRuntimeConfig?.enableCoinGecko && true)}
        className={
          `${(isMobile || !publicRuntimeConfig?.enableCoinGecko) && 
            'read-only-button-mobile'} mt-3 py-1 px-2 border border-gray-850 border-radius-4 
                   d-flex align-items-center cursor-pointer`}>
      <span className="text-white">
        {formatStringToCurrency(currentValue)}
      </span>
      <span className="text-white-30 ms-2">{currency}</span>
    </div>
    <PriceConversorModal show={isVisible} onClose={() => setIsVisible(false)}/>
    </>
  );
}

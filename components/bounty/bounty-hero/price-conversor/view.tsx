import BigNumber from "bignumber.js";
import getConfig from "next/config";

import PriceConversorModal from "components/bounty/bounty-hero/price-conversor/modal/controller";

import { formatStringToCurrency } from "helpers/formatNumber";

import { Currency } from "interfaces/currency";

import useBreakPoint from "x-hooks/use-breakpoint";

interface IPriceConversorProps {
  currentValue: BigNumber;
  currency: Currency | string;
  isVisible: boolean;
  handleIsVisible: (v: boolean) => void;
}

const { publicRuntimeConfig } = getConfig();

export default function PriceConversorView({
  currentValue,
  currency,
  isVisible,
  handleIsVisible
}: IPriceConversorProps) {
  const { isDesktopView } = useBreakPoint();

  return (
    <>
    <div onClick={()=> handleIsVisible(publicRuntimeConfig?.enableCoinGecko && true)}
        className={
          `${(!isDesktopView || !publicRuntimeConfig?.enableCoinGecko) && 
            'read-only-button-mobile'} price-conversor rounded-5 py-2 px-3 bg-black 
                   d-flex align-items-center justify-content-around cursor-pointer`}>
      <span className="text-white caption-large">
        {formatStringToCurrency(currentValue?.toFixed() || "0")}
      </span>
      <span className="text-white-30 ms-2">{currency}</span>
    </div>
    <PriceConversorModal
        value={currentValue}
        symbol={currency}
        show={isVisible}
        onClose={() => handleIsVisible(false)}
      />
    </>
  );
}

import { useState } from "react";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { Currency } from "interfaces/currency";

import PriceConversorModal from "./price-conversor-modal";

interface IPriceConversorProps {
  currentValue: number;
  currency: Currency | string;
}

export default function PriceConversor({
  currentValue,
  currency
}: IPriceConversorProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  return (
    <>
    <div onClick={()=> setIsVisible(true)} 
        className="price-conversor rounded-5 py-2 px-3 bg-black d-flex align-items-center justify-content-around cursor-pointer">
      <span className="text-white caption-large">
        {formatNumberToCurrency(currentValue)}
      </span>
      <span className="text-primary ms-2 capttion-medium">${currency}</span>
    </div>
    <PriceConversorModal show={isVisible} onClose={() => setIsVisible(false)}/>
    </>
  );
}

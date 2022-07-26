import { useTranslation } from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { formatNumberToCurrency } from "helpers/formatNumber";

import InputNumber from "./input-number";

interface InputWithBalanceProps {
  label: string;
  value: number;
  symbol: string;
  balance: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function InputWithBalance({
  value,
  onChange,
  symbol,
  balance,
  max
} : InputWithBalanceProps) {
  const { t } = useTranslation("common");

  const setMaxValue = () => onChange(max || balance);
  const handleAmountChange = ({ floatValue }) => onChange(floatValue);

  return(
    <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
      <div className="col px-0">
        <InputNumber
          classSymbol={"text-primary"}
          max={max || balance}
          value={value}
          error={value > (max || balance)}
          setMaxValue={setMaxValue}
          min={0}
          placeholder={"0"}
          thousandSeparator
          decimalSeparator="."
          decimalScale={18}
          onValueChange={handleAmountChange}
        />

      <div className="d-flex caption-small justify-content-between align-items-center p-3 mt-1 mb-1">
        <span className="text-ligth-gray">
          <span className="text-primary">${symbol}</span>{" "}
          {t("misc.available")}
        </span>

        <div className="d-flex align-items-center">
          <span className="text-gray">
            {formatNumberToCurrency(balance, {
              maximumFractionDigits: 18
            })}
          </span>

          { value > 0 &&
            <>
              <span className="svg-white-40 ml-1">
                <ArrowRightLine width={10} height={10} />
              </span>

              <span className="text-white ml-1">
                {formatNumberToCurrency(balance - value, {
                  maximumFractionDigits: 18
                })}
              </span>
            </>
          }
        </div>
      </div>
      </div>
    </div>
  );
}
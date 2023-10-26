import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";

import { formatNumberToCurrency } from "helpers/formatNumber";

import InputNumber from "./input-number";

interface InputWithBalanceProps {
  label: string;
  value: BigNumber;
  symbol: string;
  balance: BigNumber;
  max?: BigNumber;
  decimals?: number;
  onChange: (value: BigNumber) => void;
  disabled?: boolean;
}

export default function InputWithBalance({
  value,
  onChange,
  symbol,
  balance,
  max,
  decimals = 18,
  disabled
} : InputWithBalanceProps) {
  const { t } = useTranslation("common");

  const setMaxValue = () => onChange(max || balance);
  const handleAmountChange = ({ value }) => onChange(value);
  const isAllowed = ({ value: newValue }) => BigNumber(newValue !== "" && newValue || 0).lte(max || balance);

  return(
    <div className="row mx-0 bg-dark-gray border-radius-4 amount-input">
      <div className="col px-0">
        <InputNumber
          classSymbol={"text-primary"}
          max={(max || balance)?.toFixed()}
          value={value?.toFixed()}
          error={value?.gt(max || balance)}
          setMaxValue={setMaxValue}
          min={0}
          placeholder={"0"}
          thousandSeparator
          decimalSeparator="."
          decimalScale={decimals}
          onValueChange={handleAmountChange}
          isAllowed={isAllowed}
          disabled={disabled}
        />

      <div className="d-flex caption-small justify-content-between align-items-center p-3 mt-1 mb-1">
        <span className="text-light-gray">
          <span className="text-primary">{symbol}</span>{" "}
          {t("misc.available")}
        </span>

        <div className="d-flex align-items-center">
          <span className="text-gray">
            {formatNumberToCurrency(balance.toFixed(), { maximumFractionDigits: decimals })}
          </span>

          { value?.gt(0) &&
            <>
              <span className="svg-white-40 ml-1">
                <ArrowRightLine width={10} height={10} />
              </span>

              <span className="text-white ml-1">
                {formatNumberToCurrency(balance.minus(value).toFixed(), { maximumFractionDigits: decimals })}
              </span>
            </>
          }
        </div>
      </div>
      </div>
    </div>
  );
}
import {components as RSComponents ,SingleValueProps } from "react-select";

import {useTranslation} from "next-i18next";

import TransactionIcon from "assets/icons/transaction";

import InputNumber from "components/input-number";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {formatNumberToNScale} from "helpers/formatNumber";

interface IPriceConversiorModalProps {
  show: boolean;
  onClose: ()=> void;
  symbol: string;
  currentValue: number;
  handleCurrentValue: (v: number) => void;
  currentPrice: number;
  currentToken: string;
  errorCoinInfo: boolean;
  currentCurrency: Options;
  options: Options[];
  handleSelectChange: ({value, label}: Options) => void;
}

interface Options {
  value: string;
  label: string;
}

export default function PriceConversorModalView({
  show,
  onClose,
  symbol,
  currentValue,
  handleCurrentValue,
  currentPrice,
  currentToken,
  errorCoinInfo,
  currentCurrency,
  options,
  handleSelectChange
}: IPriceConversiorModalProps) {
  const { t } = useTranslation("common");

  const SingleValue = ({children, ...props}: SingleValueProps) => {

    return (
    <RSComponents.SingleValue {...props} className="proposal__select__currency">
      <div
       className="cursor-pointer d-inline-flex
       align-items-center justify-content-between
       text-center caption-large text-white p-1 w-100">
        <span>{children}</span>
      </div>
    </RSComponents.SingleValue>
    )};
  
  function SelectOptionComponent({ innerProps, innerRef, data }) {
    const current = currentCurrency?.value === data?.value
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`react-select__option p-small text-white p-2 d-flex 
                    justify-content-between hover-primary cursor-pointer 
                    text-${current? 'white' : 'gray'}`}
      >
        <span className="">{data?.label}</span>
        <span className="text-uppercase">{data?.value}</span>
      </div>
    );
  }

  return (
    <Modal
      show={show}
      title={"Converter"}
      titlePosition="center"
      onCloseClick={onClose}>
      <div className="d-flex flex-row gap-2">
        <div className="col">
          <InputNumber
            className="caption-large"
            symbol={symbol || t("common:misc.$token")}
            value={currentValue}
            onValueChange={(e) => handleCurrentValue(e.floatValue)}
          />
        </div>
        <div className="d-flex justify-center align-items-center bg-dark-gray circle-2 p-2">
          <TransactionIcon width={14} height={10} />
        </div>
        <div className="col">
          <ReactSelect
            key="select__currency"
            isSearchable={false}
            components={{
              Option: SelectOptionComponent,
              SingleValue
            }}
            value={currentCurrency}
            options={options}
            onChange={handleSelectChange}
          />
          {errorCoinInfo && (
            <p className="p-small text-danger ms-1">
              {t("bounty:fields.conversion-token.not-found")}
            </p>
          )}
        </div>
      </div>
      <div className="d-flex flex-row justify-content-center mt-4">
        {formatNumberToNScale(currentPrice * currentValue)} {currentToken}
      </div>
    </Modal>
  );
}

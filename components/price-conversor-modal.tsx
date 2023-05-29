import {useEffect, useState} from "react";
import {components as RSComponents ,SingleValueProps } from "react-select";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import TransactionIcon from "assets/icons/transaction";

import InputNumber from "components/input-number";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

import {formatNumberToNScale} from "helpers/formatNumber";

import {getCoinInfoByContract} from "services/coingecko";

interface IPriceConversiorModalProps {
  show: boolean;
  onClose: ()=> void;
  value?: BigNumber;
}
interface Options {
  value: string;
  label: string;
}

const defaultValue = [{value: "usd", label: "US Dollar"}, {value: "eur", label: "Euro"}]

export default function PriceConversorModal({
  show,
  onClose,
  value
}:IPriceConversiorModalProps) {
  const { t } = useTranslation("common");
  
  const [options, setOptions] = useState([]);
  const [currentValue, setValue] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [currentToken, setCurrentToken] = useState<string>();
  const [errorCoinInfo, setErrorCoinInfo] = useState<boolean>(false);
  const [currentCurrency, setCurrentCurrency] = useState<{label: string, value: string}>(null);

  const {state} = useAppState();

  async function handlerChange({value, label}: Options){
    if (!state.currentBounty?.data?.transactionalToken?.symbol) return;

    const data = 
      await getCoinInfoByContract(state.currentBounty?.data?.transactionalToken?.symbol)
        .catch((err) => {
          if(err) setErrorCoinInfo(true)
          return ({ prices: { [value]: 0 } })
        });

    if(data.prices[value] > 0) setErrorCoinInfo(false)
    setCurrentCurrency({value, label});
    setCurrentToken(value.toUpperCase())
    setCurrentPrice(data.prices[value]);
  }

  useEffect(()=>{
    if (!state.currentBounty?.data?.transactionalToken?.symbol) return;

    const currencyList = state.Settings?.currency?.conversionList || defaultValue;

    if(currencyList.length){
      const opt = currencyList.map(currency=>({value: currency?.value, label: currency?.label}))
      setOptions(opt)
      handlerChange(opt[0])
    }
    
  },[state.currentBounty?.data?.transactionalToken?.symbol])

  useEffect(() => {
    setValue(value?.toNumber())
  },[value])

  const SingleValue = ({children, ...props}: SingleValueProps<any>) => {

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
            symbol={state.currentBounty?.data?.transactionalToken?.symbol || t("common:misc.$token")}
            value={currentValue}
            onValueChange={(e) => setValue(e.floatValue)}
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
            defaultValue={{
              value: options[0]?.value,
              label: options[0]?.label,
            }}
            options={options}
            onChange={handlerChange}
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

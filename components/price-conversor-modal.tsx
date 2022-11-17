import {useEffect, useState} from "react";
import {components as RSComponents ,SingleValueProps } from "react-select";

import {useTranslation} from "next-i18next";

import TransactionIcon from "assets/icons/transaction";

import InputNumber from "components/input-number";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {formatNumberToNScale} from "helpers/formatNumber";

import {getCoinInfoByContract} from "services/coingecko";

import {useAppState} from "../contexts/app-state";

interface IPriceConversiorModalProps{
  show: boolean;
  onClose: ()=> void;
}

const defaultValue = [{value: "usd", label: "US Dollar"}, {value: "eur", label: "Euro"}]

export default function PriceConversorModal({
  show,
  onClose
}:IPriceConversiorModalProps) {
  const { t } = useTranslation("common");
  
  const [options, setOptions] = useState([]);
  const [currentValue, setValue] = useState<number>(1);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [errorCoinInfo, setErrorCoinInfo] = useState<boolean>(false);
  const [currentCurrency, setCurrentCurrency] = useState<{label: string, value: string}>(null);

  const {state} = useAppState();

  async function handlerChange({value, label}){
    if (!state.Service?.network?.networkToken?.address) return;

    const data = 
      await getCoinInfoByContract(state.Service?.network?.networkToken.symbol)
        .catch((err) => {
          if(err) setErrorCoinInfo(true)
          return ({ prices: { [value]: 0 } })
        });
    if(data.prices[value] > 0) setErrorCoinInfo(false)
    setCurrentCurrency({value, label});
    setCurrentPrice(data.prices[value]);
  }

  useEffect(()=>{
    const currencyList = state.Settings?.currency?.conversionList || defaultValue;
    
    if(currencyList.length){
      const opt = currencyList.map(currency=>({value: currency?.value, label: currency?.label}))
      setOptions(opt)
      handlerChange(opt[0])
    }
    
  },[])

  const SingleValue = ({
    children,
    ...props
  }: SingleValueProps<any>) => {
    console.log({props, children})
    return (
    <RSComponents.SingleValue {...props} className="proposal__select__currency">
      <div
       className="cursor-pointer d-inline-flex 
       align-items-center justify-content-between 
       text-center caption-large text-white p-1 w-100"
      >
        <span>{formatNumberToNScale(currentPrice)}</span>
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
      onCloseClick={onClose}
    >
      <div className="d-flex flex-row gap-2">
        <div>
          <InputNumber
            className="caption-large"
            symbol={
              state.Service?.network?.networkToken?.symbol || t("common:misc.$token")
            }
            value={currentValue}
            onValueChange={(e) => setValue(e.floatValue)}
          />
        </div>
        <div className="d-flex justify-center align-items-center bg-dark-gray circle-2 p-2">
          <TransactionIcon width={14} height={10} />
        </div>
        <div>
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
    </Modal>
  );
}

import { useEffect, useState } from "react";


import getConfig from "next/config";

import TransactionIcon from "assets/icons/transaction";

import Modal from "components/modal";

import { formatNumberToNScale } from "helpers/formatNumber";

import useApi from "x-hooks/use-api";

import InputNumber from "./input-number";
import ReactSelect from "./react-select";

const { publicRuntimeConfig } = getConfig();
interface IPriceConversiorModalProps{
  show: boolean;
  onClose: ()=> void;
}

const defaultValue = [{value: "usd", label: "US Dollar"}, {value: "eur", label: "Euro"}]

export default function PriceConversorModal({
  show,
  onClose
}:IPriceConversiorModalProps) {
  const {getCurrencyByToken} = useApi()
  const [currentValue, setValue] = useState<number>(1);
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [currentCurrency, setCurrentCurrency] = useState<{label: string, value: string}>(null)
  const [options, setOptions] = useState([])
  

  async function handlerChange({value, label}){
    const data = await getCurrencyByToken(publicRuntimeConfig?.currency?.currencyId, value)
    setCurrentCurrency({value, label})
    setCurrentPrice(data[value])
  }

  useEffect(()=>{
    let currencyList;
    try {
      const list = JSON.parse(publicRuntimeConfig?.currency?.currencyCompareList)
      currencyList = Array.isArray(list) ? list : defaultValue;
    } catch (error) {
      currencyList = defaultValue;
    }
    const opt = currencyList.map(currency=>({value: currency?.value, label: currency?.label}))
    setOptions(opt)
    handlerChange(opt[0])
  },[])

  function SelectValueComponent({ innerProps, innerRef, ...rest }) {
    const data = rest.getValue()[0];
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="proposal__select_currency cursor-pointer d-inline-flex align-items-center flex-grow-1 justify-content-between text-center caption-large text-white p-1"
      >
        <span>{formatNumberToNScale(currentPrice)}</span>
        <span>{data?.value}</span>
      </div>
    );
  }
  
  function SelectOptionComponent({ innerProps, innerRef, data }) {
    const current = currentCurrency?.value === data?.value
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`react-select__option p-small text-white p-2 d-flex justify-content-between hover-primary cursor-pointer text-${current? 'white' : 'gray'}`}
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
      <InputNumber className="caption-large" symbol="$Bepro" value={currentValue} onValueChange={setValue}/>
      <div className="d-flex justify-center align-items-center bg-dark-gray circle-2 p-2">
        <TransactionIcon width={14} height={10}/>
      </div>
      <ReactSelect key='select_currency'
      isSearchable={false} 
      components={{
        Option: SelectOptionComponent,
        ValueContainer: SelectValueComponent
      }}
      defaultValue={{
        value: options[0]?.value,
        label: options[0]?.label,
      }}
      options={options} 
      onChange={handlerChange} />
    </div>
  </Modal>
  );
}

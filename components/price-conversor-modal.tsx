import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import TransactionIcon from "assets/icons/transaction";

import InputNumber from "components/input-number";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import { useNetwork } from "contexts/network";
import { useSettings } from "contexts/settings";

import { formatNumberToNScale } from "helpers/formatNumber";

import { getCoinInfoByContract } from "services/coingecko";

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

  const { settings } = useSettings();
  const { activeNetwork } = useNetwork();

  async function handlerChange({value, label}){
    if (!activeNetwork?.networkToken?.address) return;

    const data = 
      await getCoinInfoByContract(activeNetwork.networkToken.address)
        .catch((err) => {
          if(err) setErrorCoinInfo(true)
          return ({ prices: { [value]: 0 } })
        });
    if(data.prices[value] > 0) setErrorCoinInfo(false)
    setCurrentCurrency({value, label});
    setCurrentPrice(data.prices[value]);
  }

  useEffect(()=>{
    const currencyList = settings?.currency?.conversionList || defaultValue;
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
        className="proposal__select_currency cursor-pointer d-inline-flex 
                   align-items-center flex-grow-1 justify-content-between 
                   text-center caption-large text-white p-1"
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
              activeNetwork?.networkToken?.symbol || t("common:misc.$token")
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
            key="select_currency"
            isSearchable={false}
            components={{
              Option: SelectOptionComponent,
              ValueContainer: SelectValueComponent,
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

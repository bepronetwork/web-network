import {useEffect, useState} from "react";
import { components as RSComponents, SingleValueProps } from "react-select";
import Creatable from "react-select/creatable";

import {useTranslation} from "next-i18next";

import DoneIcon from "assets/icons/done-icon";

import ChangeTokenModal from "components/change-token-modal";

import {formatNumberToCurrency} from "helpers/formatNumber";

import {Token} from "interfaces/token";

import {useAppState} from "../contexts/app-state";
import TokenIcon from "./token-icon";


interface TokensDropdownProps {
  defaultToken?: Token;
  tokens: Token[];
  canAddToken?: boolean;
  label?: string;
  description?: string;
  addToken: (value: Token) => void;
  setToken?: (value: Token) => void;
  userAddress?: string;
  disabled?: boolean;
  needsBalance?: boolean;
  showCurrencyValue?: boolean;
  token?: Token;
  noLabel?: boolean;
  selectOptionName?: 'symbol' | 'name'
}

interface Option {
  label: string;
  value: Token;
}

export default function TokensDropdown({
  defaultToken,
  tokens,
  addToken,
  setToken,
  canAddToken,
  label = undefined,
  description = undefined,
  userAddress,
  disabled = false,
  token,
  showCurrencyValue = true,
  needsBalance,
  noLabel,
  selectOptionName = 'symbol'
}: TokensDropdownProps) {
  const { t } = useTranslation("common");

  const [option, setOption] = useState<Option>();
  const [options, setOptions] = useState<Option[]>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {state} = useAppState();

  const formatCreateLabel = (inputValue: string) =>
    canAddToken
      ? `${t("misc.add")} ${inputValue} ${t("misc.token")}`
      : undefined;

  const tokenToOption = (token: Token): Option => ({
    label: `${token?.tokenInfo ? (token?.tokenInfo?.name || token?.name) : token.symbol}`,
    value: token,
  });

  const handleChange = (newValue) => {
    const { value, __isNew__ } = newValue;

    if (__isNew__ && !canAddToken) return;
    if (__isNew__) return setIsModalVisible(true);

    setToken(value);
    setOption(tokenToOption(value));
  };

  async function handleAddOption(newToken: Token) {
    addToken(newToken);
    setToken(newToken);
    await state.Service?.active.getTokenBalance(newToken.address, userAddress)
      .then((value) =>
        setOption(tokenToOption({ ...newToken, currentValue: value.toFixed() })))
      .catch(() => setOption(tokenToOption(newToken)));
  }

  async function getBalanceTokens() {
    Promise.all(tokens?.map(async (token) => {
      if (token?.address && userAddress) {
        const value = await state.Service?.active?.getTokenBalance(token.address, userAddress);

        return { ...token, currentValue: value.toFixed() };
      }
    }))
      .then((values) => {
        if (values[0]) {
          const tokensOptions = values.map(tokenToOption);
          setOptions(tokensOptions);
        }
      })
      .catch((err) => console.debug("err token", err));
  }

  useEffect(() => {
    if (!tokens?.length) return;
    if (needsBalance && state.connectedChain?.matchWithNetworkChain) getBalanceTokens();
    else setOptions(tokens.map(tokenToOption));
  }, [tokens, state.connectedChain?.matchWithNetworkChain]);

  useEffect(() => {
    if(!!option || !options?.length) return;

    const addressToFind = defaultToken && defaultToken.address || token?.address;

    const defaultOption = 
      addressToFind ? options.find(({ value: { address} }) => address === addressToFind) : options[0];

    handleChange(defaultOption);
  }, [token, options, defaultToken]);

  function SelectOptionComponent({ innerProps, innerRef, data }) {
    const { currentValue, symbol ,address, tokenInfo, name } = data.value;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className={`proposal__select-options d-flex align-items-center text-center p-small p-1 my-1
        ${address === option?.value?.address && "bg-black rounded"}
        `}
      >
        {data?.__isNew__ ? (
          <span className="mx-2">{formatCreateLabel(data?.value)}</span>
        ) : (
          <>
            <span className="mx-2">
              <TokenIcon
                src={tokenInfo.icon}
                size="14"
              />
            </span>
            <span className={`${tokenInfo ? null : "mx-2"}`}>
              {tokenInfo && selectOptionName === 'name' ? (tokenInfo?.name || name) : symbol}
            </span>
            <div className="d-flex flex-grow-1 justify-content-end text-uppercase me-2">
              { showCurrencyValue && 
                `${formatNumberToCurrency(currentValue)} ${tokenInfo?.symbol ? tokenInfo?.symbol : symbol}` }
              {address === option?.value?.address && (
                <DoneIcon
                  className="ms-1 text-primary"
                  width={14}
                  height={14}
                />
              )}
            </div>
          </>
        )}
      </div>
    );
  }
  function SingleValue (props: SingleValueProps<any>) {
    const data = props.getValue()[0]?.value;
    const symbol = data.tokenInfo?.symbol && data.currentValue ? data.tokenInfo?.symbol : data.symbol;

    return (
    <RSComponents.SingleValue {...props}>
      <div 
        className="cursor-pointer d-inline-flex align-items-center justify-content-between text-center w-100"
      >
        <div className="flex-grow-0 proposal__select-options d-flex align-items-center text-center p-small p-1">
          <span className="mx-2">
            <TokenIcon
              src={data?.tokenInfo?.icon}
              size="14"
            />
          </span>
          
          <span className={`${data.tokenInfo ? "mt-1" : "mx-2"}`}>
            {data.tokenInfo && selectOptionName === 'name' ? (data?.tokenInfo?.name || data?.name) : symbol}
          </span>
        </div>

        <div className="d-flex flex-grow-1 justify-content-end text-uppercase me-2">
          { showCurrencyValue && 
              `${formatNumberToCurrency(data?.currentValue)} ${symbol}`}
        </div>
      </div>
    </RSComponents.SingleValue>
    )}

  function Label({children}) {
    if(noLabel) return <>{children}</>

    return (
      <div className="form-group">
        <label className="caption-small mb-2">{label || t("misc.token")}</label>
        {children}
      </div>
    )
  }
    
  return (
    <Label>
      <Creatable
        className="react-select-container"
        classNamePrefix="react-select"
        createOptionPosition="first"
        formatCreateLabel={formatCreateLabel}
        onChange={handleChange}
        defaultValue={defaultToken && tokenToOption(defaultToken)}
        options={options}
        value={option}
        components={{
          Option: SelectOptionComponent,
          SingleValue
        }}
        isDisabled={disabled}
      />

      <ChangeTokenModal
        show={isModalVisible}
        description={description}
        setToken={handleAddOption}
        setClose={() => setIsModalVisible(false)}
      />
    </Label>
  );
}

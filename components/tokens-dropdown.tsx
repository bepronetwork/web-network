import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";

import { useTranslation } from "next-i18next";

import DoneIcon from "assets/icons/done-icon";

import ChangeTokenModal from "components/change-token-modal";

import { useDAO } from "contexts/dao";

import { Token } from "interfaces/token";

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
}: TokensDropdownProps) {
  const [options, setOptions] = useState<Option[]>();
  const [option, setOption] = useState<Option>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { service: DAOService } = useDAO();
  const { t } = useTranslation("common");

  const formatCreateLabel = (inputValue: string) =>
    canAddToken
      ? `${t("misc.add")} ${inputValue} ${t("misc.token")}`
      : undefined;

  const tokenToOption = (token: Token): Option => ({
    label: `${token?.tokenInfo ? token.tokenInfo.name : token.symbol}`,
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
    await DAOService.getTokenBalance(newToken.address, userAddress)
      .then((value) =>
        setOption(tokenToOption({ ...newToken, currentValue: value })))
      .catch(() => setOption(tokenToOption(newToken)));
  }

  async function getBalanceTokens() {
    Promise.all(tokens?.map(async (token) => {
      if (token?.address && userAddress) {
        const value = await DAOService.getTokenBalance(token.address,
                                                       userAddress);

        return { ...token, currentValue: value };
      }
    }))
      .then((values) => {
        if (values[0]) setOptions(values.map((token) => tokenToOption(token)));
      })
      .catch((err) => console.log("err token", err));
  }

  useEffect(() => {
    if (tokens) getBalanceTokens();
  }, [tokens]);

  function SelectOptionComponent({ innerProps, innerRef, data }) {
    const { name, symbol, address, currentValue, tokenInfo } = data.value;

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
            {tokenInfo?.icon && (
              <img
                src={tokenInfo.icon}
                width={14}
                height={14}
                className="mx-2"
              />
            )}
            <span className={`${tokenInfo ? null : "mx-2"}`}>
              {tokenInfo ? tokenInfo.name : name}
            </span>
            <div className="d-flex flex-grow-1 justify-content-end text-uppercase me-2">
              {currentValue} {tokenInfo?.symbol ? tokenInfo?.symbol : symbol}
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

  function SelectValueComponent(props) {
    const { getValue } = props;
    const { name, tokenInfo, currentValue, symbol } = getValue()[0].value;
    return (
      <>
        {props.children[0] !== null ? (
          <>
            <div className="flex-grow-0 proposal__select-options d-flex align-items-center text-center p-small p-1">
              {props.children[1]}
              {tokenInfo?.icon && (
                <img
                  src={tokenInfo.icon}
                  width={14}
                  height={14}
                  className="mx-2"
                />
              )}
              <span className={`${tokenInfo ? "mt-1" : "mx-2"}`}>
                {tokenInfo ? tokenInfo.name : name}
              </span>
            </div>
            <div className="d-flex flex-grow-1 justify-content-end text-uppercase me-2">
              {currentValue} {tokenInfo?.symbol && currentValue ? tokenInfo?.symbol : symbol}
            </div>
          </>
        ) : (
          props.children[1]
        )}
      </>
    );
  }

  return (
    <div className="form-group">
      <label className="caption-small mb-2">{label || t("misc.token")}</label>
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
          ValueContainer: SelectValueComponent,
        }}
        isDisabled={disabled}
      />

      <ChangeTokenModal
        show={isModalVisible}
        description={description}
        setToken={handleAddOption}
        setClose={() => setIsModalVisible(false)}
      />
    </div>
  );
}

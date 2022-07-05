import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";

import { useTranslation } from "next-i18next";

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
  disabled = false
} : TokensDropdownProps) {
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
    label: `${token.symbol}`,
    value: token,
  });

  const handleChange = (newValue) => {
    const { value, __isNew__ } = newValue;

    if (__isNew__ && !canAddToken) return;
    if (__isNew__) return setIsModalVisible(true);

    setToken(value);
    setOption(tokenToOption(value));
  };

  const handleAddOption = (newToken: Token) => {
    addToken(newToken);
    setToken(newToken);
    setOption(tokenToOption(newToken));
  };

  async function getBalanceTokens() {
    Promise.all(tokens.map(async (token) => {
      if (token?.address && userAddress) {
        const value = await DAOService.getTokenBalance(token.address,
                                                       userAddress);

        return {...token, currentValue: value };
      }
    })).then((values) => {
      console.log('values', values)
      if(values[0]) setOptions(values.map((token) => tokenToOption(token)))
    }).catch(err => console.log('err token', err))
  }

  useEffect(() => {
    if(tokens) getBalanceTokens();
  }, [tokens]);

  function SelectOptionComponent({ innerProps, innerRef, data }) {
    const { name, symbol, currentValue } = data.value;
    
    if(data.__isNew__) return 
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="proposal__select-options d-flex align-items-center text-center p-small p-1"
      >
        {data?.__isNew__ ? formatCreateLabel(name): <span>{name}</span>}
        <div className="d-flex flex-grow-1 justify-content-end">
          {currentValue} {symbol}
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      {console.log("options", options, option)}
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

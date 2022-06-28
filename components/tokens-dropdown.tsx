import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";

import { useTranslation } from "next-i18next";

import ChangeTokenModal from "components/change-token-modal";

import { Token } from "interfaces/token";

interface TokensDropdownProps {
  defaultToken?: Token;
  tokens: Token[];
  canAddToken?: boolean;
  label?: string;
  description?: string;
  disabled?: boolean;
  addToken: (value: Token) => void;
  setToken?: (value: Token) => void;
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
  disabled
} : TokensDropdownProps) {
  const [options, setOptions] = useState<Option[]>();
  const [option, setOption] = useState<Option>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation("common");

  const formatCreateLabel = 
    (inputValue: string) => canAddToken ? `${t("misc.add")} ${inputValue} ${t("misc.token")}` : undefined;
  const tokenToOption = (token: Token): Option => ({ label: `${token.symbol}`, value: token });

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
  }

  useEffect(() => {
    setOptions(tokens.map(token => tokenToOption(token)));
  }, [tokens]);

  return(
    <div className="form-group">
      <label className="caption-small mb-2">{ label || t("misc.token") }</label>
      <Creatable
        className="react-select-container"
        classNamePrefix="react-select"
        createOptionPosition="first"
        formatCreateLabel={formatCreateLabel}
        onChange={handleChange}
        defaultValue={defaultToken && tokenToOption(defaultToken)}
        options={options}
        value={option}
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
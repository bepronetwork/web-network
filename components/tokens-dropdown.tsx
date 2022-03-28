import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";

import ChangeTokenModal from "components/change-token-modal";

import { Token } from "interfaces/token";

interface TokensDropdownProps {
  defaultToken: Token;
  tokens: Token[];
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
  setToken
} : TokensDropdownProps) {
  const [options, setOptions] = useState<Option[]>();
  const [option, setOption] = useState<Option>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatCreateLabel = (inputValue: string) => `Add ${inputValue} token`;
  const tokenToOption = (token: Token): Option => ({ label: `${token.symbol} ${token.name}`, value: token });

  const handleChange = (newValue) => {
    const { value, __isNew__ } = newValue;

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
      <label className="caption-small mb-2">Token</label>
      <Creatable
        className="react-select-container"
        classNamePrefix="react-select"
        createOptionPosition="first"
        formatCreateLabel={formatCreateLabel}
        onChange={handleChange}
        defaultValue={tokenToOption(defaultToken)}
        options={options}
        value={option}
      />

      <ChangeTokenModal 
        show={isModalVisible}
        setToken={handleAddOption}
        setClose={() => setIsModalVisible(false)} 
      />
    </div>
  );
}
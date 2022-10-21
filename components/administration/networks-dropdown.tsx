import {useContext, useEffect, useState} from "react";

import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import ReactSelect from "components/react-select";

import {AppStateContext} from "../../contexts/app-state";

export default function NetworksDropDown({
  networks,
  onChange
}) {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState();
  const {state} = useContext(AppStateContext);

  function onSelected(option) {
    setSelected(option.value);
    onChange(option.value);
  }

  useEffect(() => {
    setOptions(networks.map(network => ({
      value: network.networkAddress,
      label: network.name,
      preIcon: <img src={`${state.Settings?.urls?.ipfs}/${network.logoIcon}`} width={30} height={30} />,
      isSelected: selected === network.name
    })));
  }, [networks]);

  return(
    <ReactSelect
      options={options} 
      onChange={onSelected}
      components={{
        Option: IconOption,
        SingleValue: IconSingleValue
      }}
    />
  );
}
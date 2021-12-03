import { User } from "@services/github-microservice";
import Avatar from "components/avatar";
import InputNumber from "components/input-number";
import { useEffect, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import { InputNumber as InputNumberProps } from "types/input-number";
import useApi from '@x-hooks/use-api';

interface Props extends InputNumberProps {
  by: string;
  onChangeDistribution(params: { [key: string]: number }): void;
  address: string;
  defaultPercentage?: number;
}

export default function CreateProposalDistributionItem({
  by = "",
  address = "",
  onChangeDistribution = (params = { key: 0 }) => {},
  defaultPercentage = 0,
  ...params
}: Props) {
  const [value, setValue] = useState<number>();
  const [githubLogin, setGithubLogin] = useState<string>();
  const {getUserOf} = useApi();

  function getGithubLogin() {
      getUserOf(address).then((handle: User) =>
        setGithubLogin(handle?.githubLogin)
      );
  }

  useEffect(getGithubLogin, [by]);

  function handleValueChange(params: NumberFormatValues) {
    setValue(params.floatValue);
    onChangeDistribution({ [by]: params.floatValue });
  }
  // Wasted logic.
  // todo: move within InputNumber itself.
  function handleBlur() {
    let enhancedValue = value;
    if (value > 100) {
      enhancedValue = 100;
    }
    if (!value || value < 0) {
      enhancedValue = 0;
    }

    setValue(enhancedValue);
    onChangeDistribution({ [by]: enhancedValue });
  }

  return (
    <li className="d-flex align-items-center px-3 py-1 my-1 rounded-3 bg-dark-gray">
      {githubLogin && <Avatar userLogin={githubLogin} className="me-2 mt-1"/>}
      <span className="flex-grow-1 text-uppercase">{by}</span>
      <div className="flex-shrink-0 w-20">
        <InputNumber
          value={value}
          suffix="%"
          defaultValue={defaultPercentage}
          onValueChange={handleValueChange}
          onBlur={handleBlur}
          className="text-center"
          {...params}
        />
      </div>
    </li>
  );
}

import {useContext, useEffect, useState} from "react";

import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

import {AppStateContext, useAppState} from "../contexts/app-state";

import { trimString } from "helpers/string";

export default function BranchsDropdown({
  repoId,
  onSelected,
  value,
  disabled,
}: {
  repoId: string
  onSelected: (e: { value: string }) => void
  value?: { value: string, label: string }
  disabled?: boolean
}) {

  const {state} = useAppState();

  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const [option, setOption] = useState<{ value: string; label: string }>()
  const { t } = useTranslation("common");


  function mapOptions() {
    if (!state.Service?.network?.repos?.active?.branches?.length)
      return;

    setOptions(state.Service.network.repos.active.branches.map(({branch}) => ({value: branch, label: branch})));
    setOption(options[0]);
    onSelected(option);
  }

  useEffect(() => { value?.label && setOption(value) }, [value]);
  useEffect(mapOptions, [state.Service?.network?.repos?.active?.branches]);

  function onChangeSelect(e: { value: string }) {
    onSelected(e)
    setOption({value: e.value, label: e.value})
  }

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-branch")}
      </label>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={disabled || !repoId || !options?.length}
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
      />
    </div>
  );
}

import React, {useContext, useEffect, useState} from "react";

import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

import { useAppState } from "contexts/app-state";

import { trimString } from "helpers/string";

export default function ReposDropdown({ onSelected, value, disabled }: {
  onSelected: (e: { value: { id: string; path: string; } }) => void,
  value?: { label: string, value: { id: string, path: string } }
  disabled?: boolean;
}) {
  const {state} = useAppState();

  const [options, setOptions] = useState<{ value: { id: string, path: string }; label: string }[]>();
  const [option, setOption] = useState<{ value: { id: string, path: string }; label: string }>()
  const { t } = useTranslation("common");

  function onChangeSelect(e: { value: { id: string; path: string } }) {
    onSelected(e);
    setOption({
      value: e.value,
      label: e.value.path
    });
  }

  function setOptionMapper() {
    if (!state.Service?.network?.repos?.list) return;
    setIsFetching(true)

    function mapRepo({ id: value, githubPath: label }) {
      return { value: { id: value, path: label }, label };
    }

    setOptions(state.Service?.network?.repos?.list.map(mapRepo));
    setIsFetching(false)
  }

  useEffect(setOptionMapper, [state.Service?.network?.repos?.list]);
  useEffect(() => { if(value?.value !== option?.value) setOption(value) }, [value]);

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-repository")}
      </label>
      <ReactSelect
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
        isDisabled={disabled || isFetching || !options?.length}
      />
    </div>
  );
}

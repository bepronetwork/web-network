import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

export default function BranchsDropdown({
  repoId,
  onSelected,
  value,
  disabled,
}: {
  repoId: string
  onSelected: (e: { value: string, label: string }) => void
  value?: { value: string, label: string }
  disabled?: boolean
}) {

  const {state} = useAppState();

  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const [option, setOption] = useState<{ value: string; label: string }>()
  const { t } = useTranslation("common");

  function mapOptions() {
    if (!state.Service?.network?.repos?.active?.branches?.length || !repoId)
      return;

    const _options = 
      state.Service.network.repos.active.branches.map((branch: string) => ({value: branch, label: branch}));
    setOptions(_options);

  }

  useEffect(() => { if(value?.value !== option?.value) setOption(value)}, [value]);
  useEffect(mapOptions, [state.Service?.network?.repos?.active?.branches, repoId]);

  function onChangeSelect(e: { value: string }) {
    onSelected({value: e.value, label: e.value})
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

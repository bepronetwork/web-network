import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ReactSelect from "components/react-select";

import {useAppState} from "../contexts/app-state";
import BountyLabel from "./create-bounty/create-bounty-label";


export default function BranchsDropdown({
  branches,
  repoId,
  onSelected,
  value,
  disabled,
}: {
  repoId?: string
  onSelected: (e: { value: string, label: string }) => void
  value?: { value: string, label: string }
  disabled?: boolean
  branches?: string[]
}) {

  const {state} = useAppState();

  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const [option, setOption] = useState<{ value: string; label: string }>()
  const { t } = useTranslation("common");


  function mapOptions(list: string[]) {
    setOptions(list.map((branch: string) => ({value: branch, label: branch})));
  }

  useEffect(() => { if(value?.value !== option?.value) setOption(value)}, [value]);
  useEffect(() => {
    if (!state.Service?.network?.repos?.active?.branches?.length || !repoId)
      return;
    
    mapOptions(state.Service.network.repos.active.branches)
  }, [state.Service?.network?.repos?.active?.branches, repoId]);

  useEffect(() => {
    if(branches?.length > 0){
      mapOptions(branches)
    }
  }, [branches])

  function onChangeSelect(e: { value: string }) {
    onSelected({value: e.value, label: e.value})
    setOption({value: e.value, label: e.value})
  }

  return (
    <div>
      <BountyLabel className="mb-2" required>
        {t("select-a-branch")}
      </BountyLabel>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={disabled || !options?.length}
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
      />
    </div>
  );
}

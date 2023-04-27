import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import ReactSelect from "components/react-select";

import { DISCORD_LINK } from "helpers/constants";

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
  const preSelectOptions = ["master", "main", "dev", "develop"]
  const sortOptions = (a: { value: string }) => preSelectOptions.includes(a.value) ? -1 : 0 

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

  useEffect(() => {
    if(options?.length > 0 && !option){
      const opt = preSelectOptions.find(branch => options.find(opt => opt?.value?.toLowerCase() === branch))
      if(opt) handleSetOption(opt)
    }
  }, [options])

  function onChangeSelect(e: { value: string }) {
    handleSetOption(e.value)
  }

  function handleSetOption(value: string){
    onSelected({value: value, label: value})
    setOption({value: value, label: value})
  }

  return (
    <div>
      <BountyLabel className="mb-2" required>
        {t("select-a-branch")}
      </BountyLabel>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={disabled || !options?.length}
        options={options?.sort(sortOptions)}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
      />
      {!option && (
        <div className="mt-2">
          <p className="text-gray">
            {t("support-text-branch")}{" "}
            <a href={DISCORD_LINK} target="_blank">
              {t("the-community")}.
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

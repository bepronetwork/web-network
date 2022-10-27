import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

import { useRepos } from "contexts/repos";

import { trimString } from "helpers/string";

export default function BranchsDropdown({
  repoId,
  onSelected,
  value,
  disabled,
  fromBountyCreation = false
}: {
  repoId: string
  onSelected: (e: { value: string }) => void
  value?: { value: string, label: string }
  disabled?: boolean
  fromBountyCreation?: boolean
}) {
  const { findBranch } = useRepos();
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const [option, setOption] = useState<{ value: string; label: string }>()
  const { t } = useTranslation("common");

  function onChangeSelect(e: { value: string; label: string }) {
    onSelected(e)
    setOption({
      value: e.value,
      label: trimString(e.label)
    })
  }

  async function loadBranchsFromBackend() {
    if (!repoId) return;

    setIsFetching(true)
    
    function mapRepo({ branch: value, branch: label }) {
      return { value, label };
    }
    try {
      const branchs = await findBranch(Number(repoId), fromBountyCreation);
      const optionsBranchs = branchs.map(mapRepo)
    
      if (optionsBranchs?.length) {
        setOptions(optionsBranchs);
        const defaultOption = optionsBranchs.find(opt => opt.value === value.value) || optionsBranchs[0];
        onChangeSelect(defaultOption)
      }

    } finally{
      setIsFetching(false)
    }
  }

  useEffect(() => {
    loadBranchsFromBackend();
  }, [repoId]);
 
  useEffect(() => {if(value?.value.length && value?.value !== option?.value) setOption(value) }, [value]);

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-branch")}
      </label>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={disabled || !repoId || !options?.length || isFetching}
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
      />
    </div>
  );
}

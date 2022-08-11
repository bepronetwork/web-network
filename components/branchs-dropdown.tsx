import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import IconOption from "components/icon-option";
import ReactSelect from "components/react-select";

import { useRepos } from "contexts/repos";

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
  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const [option, setOption] = useState<{ value: string; label: string }>()
  const { t } = useTranslation("common");

  async function loadBranchsFromBackend() {
    if (!repoId) return;

    function mapRepo({ branch: value, branch: label }) {
      return { value, label };
    }

    const branchs = await findBranch(Number(repoId), fromBountyCreation);
    setOptions(branchs.map(mapRepo));
  }

  useEffect(() => {
    loadBranchsFromBackend();
  }, [repoId]);

  useEffect(() => { value?.label && setOption(value) }, [value]);
  
  function onChangeSelect(e: { value: string }) {
    onSelected(e)
    setOption({
      value: e.value,
      label: e.value
    })
  }

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-branch")}
      </label>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={disabled || !repoId || !options}
        options={options}
        value={option}
        onChange={onChangeSelect}
        placeholder={t("forms.select-placeholder")}
        components={{
          Option: IconOption
        }}
      />
    </div>
  );
}

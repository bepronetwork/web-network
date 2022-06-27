import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import IconOption from "components/icon-option";
import ReactSelect from "components/react-select";

import { useRepos } from "contexts/repos";

export default function BranchsDropdown({
  repoId,
  onSelected,
  disabled
}: {
  repoId: string
  onSelected: (e: { value: string }) => void
  disabled?: boolean
}) {
  const { findBranch } = useRepos();
  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const { t } = useTranslation("common");

  async function loadBranchsFromBackend() {
    if (!repoId) return;

    function mapRepo({ branch: value, branch: label }) {
      return { value, label };
    }

    const branchs = await findBranch(Number(repoId));

    setOptions(branchs.map(mapRepo));
  }

  useEffect(() => {
    loadBranchsFromBackend();
  }, [repoId]);

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-branch")}
      </label>
      <ReactSelect
        key={`select_repo-${repoId}`}
        isDisabled={!repoId || !options}
        options={options}
        onChange={onSelected}
        placeholder={t("forms.select-placeholder")}
        components={{
          Option: IconOption
        }}
      />
    </div>
  );
}

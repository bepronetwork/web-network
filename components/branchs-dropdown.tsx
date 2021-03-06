import ReactSelect from "@components/react-select";
import { useEffect, useState } from "react";
import useRepos from "@x-hooks/use-repos";
import { useTranslation } from "next-i18next";

export default function BranchsDropdown({
  repoId,
  onSelected = (opt: { value }) => {},
}) {
  const [, { getBranchs }] = useRepos();
  const [options, setOptions] = useState<{ value: string; label: string }[]>();
  const { t } = useTranslation("common");

  async function loadBranchsFromBackend() {
    if (!repoId) return;

    function mapRepo({ branch: value, branch: label }) {
      return { value, label };
    }

    const branchs = await getBranchs(repoId);
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
      />
    </div>
  );
}

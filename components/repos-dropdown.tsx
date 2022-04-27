import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import ReactSelect from "components/react-select";

import { useRepos } from "contexts/repos";

export default function ReposDropdown({ onSelected = (opt: { value }) => {} }) {
  const { repoList } = useRepos();
  const [options, setOptions] = useState<{ value: { id: string, path: string }; label: string }[]>();
  const { t } = useTranslation("common");

  function loadReposFromBackend() {
    if (!repoList) return;

    function mapRepo({ id: value, githubPath: label }) {
      return { value: { id: value, path: label }, label };
    }

    setOptions(repoList.map(mapRepo));
  }

  useEffect(loadReposFromBackend, [repoList]);

  return (
    <div>
      <label className="caption-small mb-2 text-uppercase">
        {t("select-a-repository")}
      </label>
      <ReactSelect
        options={options}
        onChange={onSelected}
        placeholder={t("forms.select-placeholder")}
      />
    </div>
  );
}

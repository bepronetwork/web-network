import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Badge from "components/badge";
import Button from "components/button";
import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useRepos } from "contexts/repos";

import useOctokit from "x-hooks/use-octokit";

interface props {
  show: boolean,
  onConfirm: (arg: { title:string , description:string , branch:string }) => Promise<void>;
  onCloseClick: () => void;
  repo: string;
  title: string;
  description: string;
}

export default function CreatePullRequestModal({
  show = false,
  onConfirm,
  onCloseClick,
  repo = "",
  title: prTitle = "",
  description: prDescription = ""
}: props) {
  const { t } = useTranslation(["common", "pull-request"]);

  const [title, setTitle] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [options, setOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuthentication();
  const { activeRepo } = useRepos();
  const { activeIssue } = useIssue()

  const { getRepositoryBranches, getUserRepositories } = useOctokit();

  function onSelectedBranch(option) {
    setSelectedBranch(option.value);
  }

  function isButtonDisabled(): boolean {
    return [title, description, selectedBranch].some((s) => !s);
  }

  function setDefaults() {
    setTitle(prTitle);
    setDescription(prDescription);
    setSelectedBranch(undefined);
    setIsCreating(false);
  }

  function handleConfirm() {
    setIsCreating(true);
    onConfirm({ title, description, branch: selectedBranch }).finally(() =>
      setIsCreating(false));
  }

  useEffect(setDefaults, [show]);
  useEffect(() => {
    if (!user?.accessToken || !repo || !show) return;

    getUserRepositories(user.login)
    .then(repositories => {
      const filteredRepos = 
        repositories.filter(repo => (repo.isFork && repo.nameWithOwner === `${user.login}/${activeRepo?.name}`) 
                                    || repo.nameWithOwner === activeRepo?.githubPath);
      
      return Promise.all(filteredRepos
        .map(async (repository) => ({ repository, branches:  await getRepositoryBranches(repository.nameWithOwner)})));
    })
    .then(reposWithBranches => reposWithBranches
      .map(({ repository, branches }) => branches
        .map(branch => { 
          const isDisabled =  !!activeIssue.pullRequests
          .find(pr=> pr.branch.split(':')[1] === branch && pr?.userRepo === repository?.nameWithOwner);

          const postIcon = <Badge 
            color={repository.isOrganization ? "white-10" : "primary-30"}
            label={repository.isOrganization ? t("misc.organization") : t("misc.fork")}
          />

          const disabledIcon = <Badge 
          color={"danger"}
          label={`${t("pull-request:abbreviation")} ${t("pull-request:opened")}`}
        />
          return {
            value: `${repository.owner}:${branch}`, 
            label: branch,
            isDisabled,
            disabledIcon,
            postIcon,
            isSelected: !!selectedBranch && branch === selectedBranch}
        }))
      .flatMap(branch => branch))
    .then(setOptions)
    .catch(console.log);
  }, [user?.accessToken, repo, show]);

  return (
    <Modal
      size="lg"
      show={show}
      onCloseClick={onCloseClick}
      title={t("pull-request:actions.create.title")}
      titlePosition="center">
      <div className="container">
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t("forms.create-pull-request.title.label")}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="form-control"
              placeholder={t("forms.create-pull-request.title.placeholder")}
            />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t("forms.create-pull-request.description.label")}
            </label>
            <textarea
              value={description}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder={t("forms.create-pull-request.description.placeholder")}
            />
          </div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t("forms.create-pull-request.branch.label")}
            </label>
            <ReactSelect 
              options={options} 
              onChange={onSelectedBranch}
              isDisabled={!options.length}
              components={{
                Option: IconOption,
                SingleValue: IconSingleValue
              }}
              isOptionDisabled={(option) => option?.isDisabled}
              />
          </div>
        </div>
        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={isButtonDisabled() || isCreating}
            onClick={handleConfirm}
          >
            {isButtonDisabled() && <LockedIcon className="me-2" />}
            <span>{t("pull-request:actions.create.title")}</span>
            {isCreating ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>
          <Button color="dark-gray" onClick={onCloseClick}>
            {t("actions.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

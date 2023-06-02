import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import Badge from "components/badge";
import Button from "components/button";
import ContractButton from "components/contract-button";
import IconOption from "components/icon-option";
import IconSingleValue from "components/icon-single-value";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import {useAppState} from "contexts/app-state";

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

  if(!show)
    return <></>

  const { t } = useTranslation(["common", "pull-request"]);

  const [title, setTitle] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [options, setOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {state} = useAppState();

  const { getRepositoryBranches, getPullRequestList } = useOctokit();

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
    if (!state.currentUser?.login || !repo || !show || !state.Service?.network?.repos?.active?.githubPath) return;

    const [, activeName] = state.Service.network.repos.active.githubPath.split("/");

    // todo: add app-state for user-repositories ?
    getRepositoryBranches(`${state.currentUser.login}/${activeName}`)
      .then(async branches => {

        return {
          repository: {
            nameWithOwner: branches.nameWithOwner,
            isFork: branches.isFork,
            isInOrganization: branches.isInOrganization,
            owner: branches.owner
          },
          branches:  branches.branches,
          pullRequests: await getPullRequestList(branches.nameWithOwner)
        }
      })
      .then(({ repository, branches, pullRequests }) => branches.map(branch => {
        const prExistAtGh =
          pullRequests.some(b=>`${b.headRepositoryOwner.login}:${b.headRefName}` === `${repository.owner}:${branch}`);

        const prExistsInActiveIssue =
          state.currentBounty?.data.pullRequests
            .some(({userBranch: b}) => b === `${repository.owner}:${branch}`);

        const isBaseBranch =
          (state.currentBounty?.data.repository.githubPath === repository.nameWithOwner &&
            state.currentBounty?.data.branch === branch);

        let postIcon = <></>;

        if(repository.isFork)
          postIcon = <Badge
            color={"primary-30"}
            label={t("misc.fork")}
          />;


        if (repository.isInOrganization)
          postIcon =  <Badge
            color={"white-10"}
            label={t("misc.organization")}
          />;


        const disabledIcon = (prExistsInActiveIssue || prExistAtGh)
          ? <Badge color={"danger"}
                  label={`${t("pull-request:abbreviation")} ${t("pull-request:opened")}`} />
          : <></>;

        return {
          value: `${repository.owner}:${branch}`,
          label: branch,
          isDisabled: prExistsInActiveIssue || prExistAtGh || isBaseBranch,
          disabledIcon,
          postIcon,
          isSelected: !!selectedBranch && branch === selectedBranch,
          justify: "between"
        };
      }))
      .then(setOptions)
      .catch(console.log);
  }, [state.currentUser?.login, repo, show]);

  return (
    <Modal
      size="lg"
      show={show}
      onCloseClick={onCloseClick}
      onCloseDisabled={isCreating}
      title={t("pull-request:actions.create.title")}
      footer={
        (
          <div className="d-flex justify-content-between">
          <Button color="dark-gray" onClick={onCloseClick} disabled={isCreating}>
              {t("actions.cancel")}
            </Button>

            <ContractButton
              disabled={isButtonDisabled() || isCreating}
              onClick={handleConfirm}
              withLockIcon={isButtonDisabled()}
              isLoading={isCreating}
            >
              <span>{t("pull-request:actions.create.title")}</span>
            </ContractButton>
          </div>
        )
      }
      titlePosition="center">
      <div className="container">
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray" title={t("forms.is.required")}>
              {t("forms.create-pull-request.title.label")} *
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
            <label className="caption-small mb-2 text-gray" title={t("forms.is.required")}>
              {t("forms.create-pull-request.description.label")} *
            </label>
            <textarea
              value={description}
              rows={5}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              placeholder={t("forms.create-pull-request.description.placeholder")}
            />
          </div>
          <div className="form-group mb-0">
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
      </div>
    </Modal>
  );
}
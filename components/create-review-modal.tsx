import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Avatar from "components/avatar";
import Button from "components/button";
import GithubInfo from "components/github-info";
import Modal from "components/modal";

import { useRepos } from "contexts/repos";

import { formatDate } from "helpers/formatDate";

export default function CreateReviewModal({
  show = false,
  isExecuting = false,
  onConfirm = ({ body }) => {},
  onCloseClick = () => {},
  issue,
  pullRequest
}) {
  const [body, setBody] = useState("");
  const { activeRepo } = useRepos();
  const { t } = useTranslation(["common", "pull-request"]);

  function isButtonDisabled(): boolean {
    return body.trim() === "" || isExecuting;
  }

  function setDefaults() {
    setBody("");
  }

  useEffect(setDefaults, [show]);

  return (
    <Modal
      size="lg"
      show={show}
      onCloseClick={onCloseClick}
      title={t("modals.create-review.title")}
      titlePosition="center"
    >
      <div className="container">
        <div className="mb-2">
          <p className="caption-small trans mb-2">
            #{issue?.githubId} {issue?.title}
          </p>

          <p className="h4 mb-2">
            {t("pull-request:label")} #{pullRequest?.githubId}
          </p>

          <div className="d-flex align-items-center flex-wrap justify-content-center justify-content-md-start">
            <span className="caption-small text-gray mr-2">
              {t("misc.created-at")}{" "}
              {pullRequest && formatDate(pullRequest?.createdAt)}
            </span>

            <GithubInfo
              parent="modal"
              variant="repository"
              label={activeRepo?.githubPath?.split("/")[1]}
            />

            <span className="caption-small text-gray ml-2 mr-2">
              {t("misc.by")}
            </span>

            <GithubInfo
              parent="modal"
              variant="user"
              label={`@${pullRequest?.githubLogin}`}
            />

            <Avatar className="ml-2" userLogin={pullRequest?.githubLogin} />
          </div>
        </div>
        <div>
          <div className="form-group">
            <label className="caption-small mb-2 text-gray">
              {t("modals.create-review.fields.review.label")}
            </label>
            <textarea
              value={body}
              rows={5}
              onChange={(e) => setBody(e.target.value)}
              className="form-control"
              placeholder={t("modals.create-review.fields.review.placeholder")}
            />
          </div>
        </div>
        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={isButtonDisabled()}
            onClick={() => onConfirm({ body })}
          >
            {isButtonDisabled() && !isExecuting && (
              <LockedIcon className="me-2" />
            )}
            <span>{t("modals.create-review.create-review")}</span>
            {isExecuting ? (
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

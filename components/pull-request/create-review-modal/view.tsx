import { ChangeEvent } from "react";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import Button from "components/button";
import GithubInfo from "components/github-info";
import Modal from "components/modal";

import { formatDate } from "helpers/formatDate";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

import ContractButton from "../../contract-button";

interface CreateReviewModalViewProps {
  show: boolean;
  isExecuting: boolean;
  onCloseClick: () => void;
  pullRequest: PullRequest;
  currentBounty: IssueBigNumberData;
  body: string;
  handleChangeBody: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  isButtonDisabled: () => boolean;
  handleConfirm: () => void;
}

export default function CreateReviewModalView({
  show = false,
  isExecuting = false,
  onCloseClick,
  pullRequest,
  currentBounty,
  body,
  handleChangeBody,
  isButtonDisabled,
  handleConfirm,
}: CreateReviewModalViewProps) {
  const { t } = useTranslation(["common", "pull-request"]);

  const { isMobileView } = useBreakPoint();

  return (
    <Modal
      size={isMobileView ? "sm" : "lg"}
      show={show}
      onCloseClick={onCloseClick}
      title={t("modals.create-review.title")}
      titlePosition="center"
      footer={
        <>
          <div className="d-flex pt-2 justify-content-between">
            <Button
              color="dark-gray"
              onClick={onCloseClick}
              disabled={isExecuting}
              withLockIcon={isExecuting}
            >
              {t("actions.cancel")}
            </Button>

            <ContractButton
              disabled={isButtonDisabled()}
              onClick={handleConfirm}
              isLoading={isExecuting}
              withLockIcon={isMobileView ? false : (isButtonDisabled() && !isExecuting)}
            >
              <span>{t("modals.create-review.create-review")}</span>
            </ContractButton>
          </div>
        </>
      }
    >
      <div className="container">
        <div className="mb-2">
          <p className="caption-small trans mb-2">
            #{currentBounty?.id} {currentBounty?.title}
          </p>

          <p className="h4 mb-2">
            {t("pull-request:label")} #{pullRequest?.githubId}
          </p>

          <div className="row d-flex align-items-center flex-wrap justify-content-center justify-content-md-start">
            <div className="d-flex align-items-center flex-wrap-reverse justify-content-start ">
              <div className="d-flex align-items-center justify-content-center me-2 mt-2">
                <Avatar className="me-2" userLogin={pullRequest?.githubLogin} />
                <GithubInfo
                  parent="modal"
                  variant="user"
                  label={`@${pullRequest?.githubLogin}`}
                />
              </div>

              <span className="caption-small text-gray me-2 mt-2">
                {t("misc.created-at")}{" "}
                {pullRequest && formatDate(pullRequest?.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="caption-small mb-2 text-gray">
            {t("modals.create-review.fields.review.label")}
          </label>

          <textarea
            value={body}
            rows={5}
            onChange={handleChangeBody}
            className="form-control"
            placeholder={t("modals.create-review.fields.review.placeholder")}
          />
        </div>
      </div>
    </Modal>
  );
}

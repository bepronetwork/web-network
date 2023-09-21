import { ChangeEvent } from "react";

import { useTranslation } from "next-i18next";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import Button from "components/button";
import ContractButton from "components/contract-button";
import GithubInfo from "components/github-info";
import Modal from "components/modal";

import { formatDate } from "helpers/formatDate";

import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

import useBreakPoint from "x-hooks/use-breakpoint";

interface CreateReviewModalViewProps {
  show: boolean;
  isExecuting: boolean;
  onCloseClick: () => void;
  deliverable: Deliverable;
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
  deliverable,
  currentBounty,
  body,
  handleChangeBody,
  isButtonDisabled,
  handleConfirm,
}: CreateReviewModalViewProps) {
  const { t } = useTranslation(["common", "deliverable"]);

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
            {t("deliverable:label")} #{deliverable?.id}
          </p>

          <div className="row d-flex align-items-center flex-wrap justify-content-center justify-content-md-start">
            <div className="d-flex align-items-center flex-wrap-reverse justify-content-start ">
              <div className="d-flex align-items-center justify-content-center me-2 mt-2">
                <div className="me-2">
                  <AvatarOrIdenticon user={deliverable?.user?.githubLogin} address={deliverable?.user?.address} />
                </div>
                {deliverable?.user?.githubLogin && (
                  <GithubInfo
                    parent="modal"
                    variant="user"
                    label={`@${deliverable?.user?.githubLogin}`}
                  />
                )}
              </div>

              <span className="caption-small text-gray me-2 mt-2">
                {t("misc.created-at")}{" "}
                {deliverable && formatDate(deliverable?.createdAt)}
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

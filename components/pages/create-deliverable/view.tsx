import { ChangeEvent } from "react";

import clsx from "clsx";
import { useTranslation } from "next-i18next";

import BountyLabel from "components/bounty/create-bounty/create-bounty-label";
import CheckButtons from "components/check-buttons/controller";
import DescriptionAndPreview from "components/common/description-and-preview/controller";
import { ContextualSpan } from "components/contextual-span";
import If from "components/If";
import MakeDeliverableRedyModal from "components/modals/make-deliverable-ready/controller";
import OpenGraphPreview from "components/open-graph-preview/controller";
import FooterButtons from "components/pages/create-deliverable/footer-buttons/view";
import ResponsiveWrapper from "components/responsive-wrapper";

import { OriginLinkErrors } from "interfaces/enums/Errors";

import { SelectOption } from "types/utils";

interface CreateDeliverablePageViewProps {
  checkButtonsOptions: SelectOption[];
  checkButtonsOption: string;
  originLink: string;
  originLinkPlaceHolder: string;
  onChangeOriginLink: (v: ChangeEvent<HTMLInputElement>) => void;
  description: string;
  onChangeDescription: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  title: string;
  onChangeTitle: (e: ChangeEvent<HTMLInputElement>) => void;
  onHandleBack: () => void;
  onHandleCreate: () => void;
  createIsLoading: boolean;
  originLinkError: OriginLinkErrors;
  createdDeliverableId: number;
  bountyContractId: number;
  previewError?: boolean;
  previewLoading?: boolean;
  onPreviewStatusChange?: (status: string) => void;
}

export default function CreateDeliverablePageView({
  originLink,
  originLinkPlaceHolder,
  onChangeOriginLink,
  title,
  onChangeTitle,
  description,
  onChangeDescription,
  onHandleBack,
  onHandleCreate,
  checkButtonsOption,
  checkButtonsOptions,
  createIsLoading,
  originLinkError,
  createdDeliverableId,
  bountyContractId,
  onPreviewStatusChange,
  previewError,
  previewLoading,
}: CreateDeliverablePageViewProps) {
  const { t } = useTranslation(["common", "bounty", "deliverable"]);

  const isCreateButtonDisabled = !title || !description || !originLink || createIsLoading || 
    previewError || previewLoading;

  return (
    <div className="row justify-content-center mx-0">
      <div className="col-md-8 bg-gray-900 border border-gray-800 border-radius-4 mt-5 p-4">
        <div>
          <h5>{t("deliverable:create.title")}</h5>
          <p className="text-gray-200">{t("deliverable:create.description")}</p>
        </div>
        <div className="pt-2">
          <span>{t("deliverable:create.type")}</span>
          <p className="text-gray-200">
            {t("deliverable:create.description-type")}
          </p>
        </div>
        <div className="mb-4 mt-4">
          <p>{t("deliverable:create.type")}</p>
          <CheckButtons
            checked={checkButtonsOption}
            options={checkButtonsOptions}
            disabled
          />
        </div>

        <div>
          <p className="text-gray-200">{t("deliverable:create.info-type")}</p>
        </div>

        <div>
          <div className="row justify-content-center mb-3">
            <div className="col-md-12 m-0 mb-2">
              <div className="form-group">
                <BountyLabel className="mb-2 text-white" required>
                  {t("deliverable:create.labels.origin-link")}
                </BountyLabel>

                <input
                  type="text"
                  className={clsx("form-control bg-gray-850 rounded-lg", {
                    "border border-1 border-danger border-radius-8": originLinkError || previewError,
                  })}
                  placeholder={originLinkPlaceHolder}
                  value={originLink}
                  onChange={onChangeOriginLink}
                />

                <If condition={previewError && !originLinkError}>
                  <ContextualSpan context="danger" className="mt-2">
                    {t("deliverable:actions.preview.failed-to-get")}
                  </ContextualSpan>
                </If>

                <If condition={originLinkError === OriginLinkErrors.Banned}>
                  <ContextualSpan context="danger" className="mt-2">
                    {t("bounty:errors.banned-domain")}
                  </ContextualSpan>
                </If>

                <If condition={originLinkError === OriginLinkErrors.Invalid}>
                  <ContextualSpan context="danger" className="mt-2">
                    {t("bounty:errors.invalid-link")}
                  </ContextualSpan>
                </If>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-12 m-0 mb-2">
              <div className="form-group">
                <BountyLabel className="mb-2 text-white">
                  {t("deliverable:create.labels.preview")}
                </BountyLabel>

                <OpenGraphPreview
                  url={originLink}
                  onStatusChange={onPreviewStatusChange}
                  previewPlaceholder={t("deliverable:create.placeholders.preview")}
                />
              </div>
            </div>
          </div>

          <div className="row justify-content-center mb-3">
            <div className="col-md-12 m-0 mb-2">
              <div className="form-group">
                <BountyLabel className="mb-2 text-white" required>
                  {t("deliverable:create.labels.title")}
                </BountyLabel>
                <input
                  type="text"
                  className={clsx("form-control bg-gray-850 rounded-lg", {
                    "border border-1 border-danger border-radius-8": false,
                  })}
                  placeholder={t("deliverable:create.placeholders.title")}
                  value={title}
                  onChange={onChangeTitle}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <DescriptionAndPreview
              description={description}
              handleChangeDescription={onChangeDescription}
              borderColor="gray-800"
              textAreaColor="gray-850"
            />
          </div>

          <p className="text-gray-200">
            {t("deliverable:create.markdown-helper")}{" "}
            <a
              href="https://www.markdownguide.org/getting-started/"
              target="_blank"
              rel="noopener noreferer"
            >
              {t("deliverable:create.markdown-link")}
            </a>
          </p>
        </div>
      </div>
      <div className="row justify-content-center px-0 mx-0">
      <div className="col-md-8 mx-0 px-0">
      <ResponsiveWrapper className="d-flex justify-content-center my-4" xs={false} md={true}>
          <FooterButtons
            handleBack={onHandleBack}
            handleCreate={onHandleCreate}
            disabledCreate={isCreateButtonDisabled}
            isLoadingCreate={createIsLoading}
          />
        </ResponsiveWrapper>
        <ResponsiveWrapper className="my-4 mx-1" xs={true} md={false}>
          <FooterButtons
            handleBack={onHandleBack}
            handleCreate={onHandleCreate}
            disabledCreate={isCreateButtonDisabled}
            isLoadingCreate={createIsLoading}
          />
        </ResponsiveWrapper>
      </div>

      </div>

      <MakeDeliverableRedyModal
        bountyContractId={bountyContractId}
        deliverableId={createdDeliverableId}
      />
    </div>
  );
}

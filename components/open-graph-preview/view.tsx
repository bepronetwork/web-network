import { useTranslation } from "next-i18next";

import ArrowUpRight from "assets/icons/arrow-up-right";

import If from "components/If";

interface OpenGraphPreviewViewProps {
  isFetching: boolean;
  isImage: boolean;
  previewPlaceholder?: string
  errorPlaceholder?: string
  preview: string;
  showOpenLink?: boolean;
  url: string;
  openLinkText?: string;
  noPreviewAvailable: boolean;
  isError: boolean;
}

export default function OpenGraphPreviewView({
  isFetching,
  isImage,
  previewPlaceholder,
  preview,
  showOpenLink,
  url,
  openLinkText,
  noPreviewAvailable,
  isError,
  errorPlaceholder,
}: OpenGraphPreviewViewProps) {
  const { t } = useTranslation("common");

  return(
    <div className="d-flex p-3 flex-column align-items-center border border-radius-4 border-gray-800 comment">
      <If
        condition={!isFetching}
        otherwise={<span className="spinner-border spinner-border m-5" />}
      >
        <If
          condition={!!preview}
          otherwise={
            <span className="p-5 sm-regular text-gray-600">
              <If
                condition={!isError}
                otherwise={errorPlaceholder || t("open-graph-preview.failed-to-get")}
              >
                { noPreviewAvailable || !previewPlaceholder ? t("open-graph-preview.no-preview") : previewPlaceholder }
              </If>
            </span>
          }
        >
          <If
            condition={isImage}
            otherwise={
              <video src={preview} controls>
                {t("open-graph-preview.video-not-supported")}
              </video>
            }
          >
            <img src={preview} className="border-radius-8" />
          </If>
        </If>

        <If condition={showOpenLink}>
          <div className="w-100 text-left mt-3 text-truncate text-blue-200">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferer" 
              className="sm-regular text-decoration-none text-blue-200"
            >
              <span className="mr-1">
                { openLinkText || t("open-graph-preview.open-link") }
              </span>

              <ArrowUpRight />
            </a>
          </div>
        </If>
      </If>
    </div>
  );
}
import { useTranslation } from "next-i18next";

import ArrowUpRight from "assets/icons/arrow-up-right";

import If from "components/If";

interface OpenGraphPreviewViewProps {
  isFetching: boolean;
  isImage: boolean;
  previewPlaceholder?: string
  preview: string;
  showOpenLink?: boolean;
  url: string;
  openLinkText?: string;
}

export default function OpenGraphPreviewView({
  isFetching,
  isImage,
  previewPlaceholder,
  preview,
  showOpenLink,
  url,
  openLinkText,
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
              { previewPlaceholder || t("open-graph-preview.no-preview") }
            </span>
          }
        >
          <If
            condition={isImage}
            otherwise={
              <video src={preview} controls></video>
            }
          >
            <img src={preview} className="border-radius-8" />
          </If>
        </If>

        <If condition={showOpenLink && !!preview}>
          <div className="w-100 text-left mt-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferer" 
              className="sm-regular text-decoration-none text-blue-200"
            >
              <span className="mr-1">
                { openLinkText || t("open-graph-preview.view-link") }
              </span>

              <ArrowUpRight />
            </a>
          </div>
        </If>
      </If>
    </div>
  );
}
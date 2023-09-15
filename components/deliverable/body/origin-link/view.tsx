import { useTranslation } from "next-i18next";

import { metadata } from "interfaces/metadata";

export default function DeliverableOriginLinkView({
  url,
  previewLink,
  previewIsLoading,
}: {
  url: string;
  previewLink?: metadata;
  previewIsLoading?: boolean;
}) {
  const { t } = useTranslation(["deliverable"]);

  return (
    <div className="border-radius-8 p-3 bg-gray-900 mb-3">
      <h3 className="caption-medium mb-3">{t("create.labels.origin-link")}</h3>
      <div className="d-flex p-1 ps-3 border-radius-8 bg-gray-850 mb-3 border-gray-700 border">
        <a href={url} target="_blank" className="text-truncate">
          {url}
        </a>
      </div>
      {previewLink && (
        <>
          <h3 className="caption-medium mb-3">{t("create.labels.preview")}</h3>
          <div className="d-flex p-1 ps-3 border-radius-8 bg-gray-850 mb-3 border-gray-700 border comment">
            {previewIsLoading ? (
              <span className="spinner-border spinner-border m-5" />
            ) : (
              <>
                {previewLink?.ogImage && <img src={previewLink.ogImage} />}
                {previewLink?.ogVideo && !previewLink?.ogImage && (
                  <video src={previewLink.ogVideo} controls>
                    {t("deliverable:actions.preview.video-error")}
                  </video>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

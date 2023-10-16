import { useTranslation } from "next-i18next";

import OpenGraphPreview from "components/open-graph-preview/controller";

interface DeliverableOriginLink {
  url: string;
}

export default function DeliverableOriginLink({
  url
}: DeliverableOriginLink) {
  const { t } = useTranslation(["deliverable"]);

  return (
    <div className="border-radius-8 p-3 bg-gray-900 mb-3">
      <h3 className="caption-medium mb-3">
        {t("create.labels.origin-link")}
      </h3>
      <OpenGraphPreview
        url={url}
        openLinkText={url}
        showOpenLink
      />
    </div>
  );
}

import { useTranslation } from "next-i18next";

import MarkedRender from "components/MarkedRender";

export default function DeliverableDescription({
  description,
}: {
  description: string;
}) {
  const { t } = useTranslation(["common"]);

  return (
    <div className="border-radius-8 p-3 bg-gray-900 mb-3">
      <h3 className="caption-medium mb-3">{t("misc.description")}</h3>
      <div className="border-radius-8 p-3 bg-gray-850 mb-3 border-gray-700 border">
        <MarkedRender source={description} />
      </div>
    </div>
  );
}

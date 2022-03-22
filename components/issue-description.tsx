import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";

import MarkedRender from "components/MarkedRender";

export default function IssueDescription({ description }) {
  const { t } = useTranslation("common");

  return (
    <div className="content-wrapper mb-3">
      <h3 className="caption-large mb-3">{t("misc.description")}</h3>
      <div className="bg-dark-gray p-3 rounded">
        <div className="p p-1">
          <MarkedRender source={description} />
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};

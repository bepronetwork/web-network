import { ReactElement } from "react";

import { useTranslation } from "next-i18next";

import ResponsiveWrapper from "components/responsive-wrapper";

export default function RenderItemRow({
  children,
  label = "",
  description = "",
  borderBottom = true,
  handleLink,
}: {
  children: ReactElement;
  label: string;
  description: string;
  borderBottom?: boolean;
  handleLink?: () => void;
}) {
  const { t } = useTranslation(["common"]);

  function Link() {
    return (
      <a onClick={handleLink} className="ms-1 text-primary cursor-pointer">
        {t("common:misc.learn-more")}
      </a>
    );
  }

  return (
    <div
      className={`mt-4 pb-4 ${
        borderBottom ? "border-bottom border-gray-700" : ""
      }`}
    >
      <div className="d-flex justify-content-between">
        <label className="text-white">{label}</label>
        {handleLink && (
          <ResponsiveWrapper xs={true} md={false}>
            {Link()}
          </ResponsiveWrapper>
        )}
      </div>

      <div className="row justify-content-between">
        <div className="col-md-6 col-12 text-gray mt-1">
          {handleLink ? (
            <>
              <ResponsiveWrapper xs={false} md={true}>
                <div>
                  {description} {Link()}
                </div>
              </ResponsiveWrapper>
              <ResponsiveWrapper xs={true} md={false}>
                {description}
              </ResponsiveWrapper>
            </>
          ) : (
            description
          )}
        </div>
        <div className="col-md-4 col-12 mt-1">{children}</div>
      </div>
    </div>
  );
}

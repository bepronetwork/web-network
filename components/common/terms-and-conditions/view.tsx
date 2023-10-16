import { useTranslation } from "next-i18next";

import { PRIVACY_POLICY_LINK, TERMS_AND_CONDITIONS_LINK } from "helpers/constants";

export default function TermsAndConditions() {
  const { t } = useTranslation("common");

  return(
    <div className="caption-small font-weight-medium text-center text-uppercase mt-1 pt-1">
      <span className="text-light-gray">{t("misc.by-connecting")} </span>

      <a
        href={TERMS_AND_CONDITIONS_LINK}
        target="_blank"
        className="text-decoration-none text-primary"
        rel="noreferrer"
      >
        {t("misc.terms-and-conditions")}
      </a>{" "}

      <span className="text-light-gray">{t("misc.and")} </span>

      <a
        href={PRIVACY_POLICY_LINK}
        target="_blank"
        className="text-decoration-none text-primary"
        rel="noreferrer"
      >
        {t("misc.privacy-policy")}
      </a>
    </div>
  );
}
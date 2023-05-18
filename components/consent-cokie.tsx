import CookieConsent from "react-cookie-consent";

import { useTranslation } from "next-i18next";

import { TERMS_AND_CONDITIONS_LINK } from "helpers/constants";

export default function ConsentCookie() {
  const { t } = useTranslation("common");

  return(
    <CookieConsent
      location="bottom"
      buttonText={t("cookie-consent.button-label")}
      cookieName="webNetworkCookieConsent"
      expires={150}
      disableStyles
    >
      {t("cookie-consent.message")}{" "}
      <a 
        href={TERMS_AND_CONDITIONS_LINK}
        className="text-decoration-none text-blue-400"
        target="_blank"
        rel="noreferrer"
      > 
        {t("status.terms-and-conditions")}
      </a> {t("misc.apply")}.
    </CookieConsent>
  );
}
import CookieConsent from "react-cookie-consent";

import { useTranslation } from "next-i18next";

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
      {t("cookie-consent.message")}
    </CookieConsent>
  );
}
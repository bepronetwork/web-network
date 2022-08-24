import { useTranslation } from "next-i18next";

import Modal from "components/modal";

export default function SettingsNotLoaded({ isVisible  }) {
  const { t } = useTranslation("common");

  if (!isVisible) return <></>;
  
  return (
    <div className="container-fluid vw-100 vh-100 bg-image bg-main-image">
      <Modal
        centerTitle
        show={isVisible}
        title={t("modals.settings-not-loaded.title")}
      >
        <div>
          <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
            <p className="caption-small text-gray">
              {t("modals.settings-not-loaded.description")}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

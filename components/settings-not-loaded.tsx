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
        title="Failed to load settings">
        <div>
          <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
            <p className="caption-small text-gray">
              Please reload the page or contact the administrator.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

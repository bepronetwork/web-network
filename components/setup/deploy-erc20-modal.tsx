import { useTranslation } from "next-i18next";

import { ERC20Details } from "components/custom-network/erc20-details";
import Modal from "components/modal";

export function DeployERC20Modal({
  show = false,
  handleHide,
  onChange
}) {
  const { t } = useTranslation("setup");

  function handleChange(value: string) {
    if (value === "") return;

    onChange(value, true);
    handleHide();
  }

  return(
    <Modal
      show={show}
      onCloseClick={handleHide}
      title={t("registry.modals.deploy-erc20.title")}
      size="lg"
    >
      <ERC20Details
        deployer
        onChange={handleChange}
      />
    </Modal>
  );
}
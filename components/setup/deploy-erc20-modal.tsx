import { useTranslation } from "next-i18next";

import { ERC20Details } from "components/custom-network/erc20-details";
import Modal from "components/modal";

interface DeployERC20ModalProps {
  show?: boolean;
  handleHide: () => void;
  onChange: (value: string, validated?: boolean) =>  void;
  onChangeMinAmount: (value: string) => void;
}

export function DeployERC20Modal({
  show = false,
  handleHide,
  onChange,
  onChangeMinAmount
}: DeployERC20ModalProps) {
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
        onChangeMinAmount={onChangeMinAmount}
        minimum
      />
    </Modal>
  );
}
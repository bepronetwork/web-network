import { ERC20Details } from "components/custom-network/erc20-details";
import Modal from "components/modal";

export function DeployERC20Modal({
  show = false,
  handleHide,
  onChange
}) {
  function handleChange(value: string) {
    if (value === "") return;

    onChange(value);
    handleHide();
  }

  return(
    <Modal
      show={show}
      onCloseClick={handleHide}
      title="New ERC20 Token"
      size="lg"
    >
      <ERC20Details
        deployer
        onChange={handleChange}
      />
    </Modal>
  );
}
import MarkedRender from "components/MarkedRender";
import Modal from "components/modal";

export default function DescriptionPreviewModal({
  show,
  description,
  onClose
}) {

  return (
    <Modal
      size="xl"
      show={show}
      onCloseClick={onClose}
    >
      <MarkedRender source={description} />
    </Modal>
  );
}

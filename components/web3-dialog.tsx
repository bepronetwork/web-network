import { kebabCase } from "lodash";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import WebThreeUnavailable from "../assets/web3-unavailable";
import { isWebThreeInstalled } from "../helpers";
import plaintText from "../plain-text";

export default function WebThreeDialog() {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    setShow(isWebThreeInstalled());
  }, [isWebThreeInstalled()]);
  function handleClickTryAgain() {
    window.location.reload();
  }

  return (
    <Modal
      centered
      aria-labelledby={`${kebabCase("WebThreeDialog")}-modal`}
      aria-describedby={`${kebabCase("WebThreeDialog")}-modal`}
      show={!show}>
      <Modal.Header>
        <Modal.Title>{plaintText.enUs["0000"]}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="p-small text-white-50 text-center">
          {plaintText.enUs["0001"]}
        </p>
        <div className="d-flex flex-column align-items-center">
          <WebThreeUnavailable />
          <p className="p mb-0 text-center">{plaintText.enUs["0002"]}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <a
          className="btn btn-md btn-opac"
          href="https://metamask.io/download.html"
          rel="noopener noreferrer"
          target="_blank">
          install
        </a>
        <button
          className="btn btn-md btn-primary"
          onClick={handleClickTryAgain}>
          Try again
        </button>
      </Modal.Footer>
    </Modal>
  );
}

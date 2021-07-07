import { kebabCase } from "lodash";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import WebThreeUnavailable from "../assets/web3-unavailable";
import isWebThreeInstalled from "../helpers/isWebThreeInstalled";

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
        <Modal.Title>MetaMask not detected</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="p-small text-white-50 text-center">
          No ETH account available
        </p>
        <div className="d-flex flex-column align-items-center">
          <WebThreeUnavailable />
          <p className="p mb-0 mt-4 text-center">
            Click upon install and follow the instructions to configure it. Make
            sure your wallet is unlocked, you have at least one account in your
            accounts list and try again.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <a
          className="btn btn-md btn-opac"
          href="https://metamask.io/download.html"
          rel="noopener noreferrer"
          target="_blank">
          Install
        </a>
        <button
          className="btn btn-md btn-primary"
          onClick={handleClickTryAgain}>
          Try Again
        </button>
      </Modal.Footer>
    </Modal>
  );
}

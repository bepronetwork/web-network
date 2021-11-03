import { kebabCase } from "lodash";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import WebThreeUnavailable from "@assets/web3-unavailable";
import Button from "./button";

export default function WebThreeDialog() {
  const [show, setShow] = useState<boolean>(false);

  function handleClickTryAgain() {
    window.location.reload();
  }

  useEffect(() => {
    setShow(!window?.ethereum);
  }, []);

  return (<>
    <Modal
      centered
      aria-labelledby={`${kebabCase("WebThreeDialog")}-modal`}
      aria-describedby={`${kebabCase("WebThreeDialog")}-modal`}
      show={show}>
      <Modal.Header>
        <Modal.Title>MetaMask not detected</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="smallCaption text-warning text-center">
          No ETH account available
        </p>
        <div className="d-flex flex-column align-items-center">
          <WebThreeUnavailable />
          <p className="p mb-0 mt-4 text-center fs-small">
          It seems that you don’t have a MetaMask account selected. 
          If using MetaMask, please make sure that your wallet is unlocked and that you have at least one account in your accounts list.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <a
          className="text-decoration-none"
          href="https://metamask.io/download.html"
          rel="noopener noreferrer"
          target="_blank">
          <Button color="dark-gray">
              Install
          </Button>
        </a>
        <Button
          onClick={handleClickTryAgain}>
          Try Again
        </Button>
      </Modal.Footer>
    </Modal>
  </>);
}

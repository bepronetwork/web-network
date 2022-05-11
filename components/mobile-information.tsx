import { kebabCase } from "lodash";
import { Modal } from "react-bootstrap";

export default function MobileInformation() {
  return (
    <div>
      <Modal centered backdrop={false}
             aria-labelledby={`${kebabCase("Mobile-Information")}-modal`}
             aria-describedby={`${kebabCase("Mobile-Information")}-modal`}
             show={true}>
        <Modal.Header>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center">
            <span className="material-icons text-blue">info</span>
            <p className="text-white mb-0 mt-4 text-center">
              Our web application currently does not support a mobile version.
            </p>
            <p className="text-white mb-0 mt-4 text-center">
              If you want to use it you must connect to our web application via
              desktop.
            </p>
            <p className="text-white-50 mb-0 mt-4 text-center">
              Stay updated on
            </p>
            <a href="https://www.bepro.network/">@bepronet</a>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </div>
  );
}

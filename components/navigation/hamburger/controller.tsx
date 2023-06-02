import { useState } from "react";

import HamburgerButtonView from "components/navigation/hamburger/view";

export default function HamburgerButton() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return(
    <HamburgerButtonView
      show={show}
      onOpenClick={handleShow}
      onCloseClick={handleClose}
    />
  );
}
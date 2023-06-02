import { useState } from "react";

import HelpIcon from "assets/icons/help-icon";

import Button from "components/button";
import HelpModal from "components/common/modals/help/view";

export default function HelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  function handleShowModal() {
    setShowHelp(true);
  }

  function handleHideModal() {
    setShowHelp(false);
  }

  return(
    <>
      <Button
        onClick={handleShowModal}
        className="bg-gray-850 border-gray-850 rounded p-2"
        transparent
      >
        <HelpIcon />
      </Button>

      <HelpModal show={showHelp} onCloseClick={handleHideModal} />
    </>
  );
}
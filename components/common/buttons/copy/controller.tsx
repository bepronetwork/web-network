import { useState, useEffect } from "react";

import CopyButtonView from "components/common/buttons/copy/view";

import { CopyValue } from "helpers/copy-value";

import { CopyButtonProps } from "types/components";

export default function CopyButton(props: CopyButtonProps) {
  const [showPopOver, setShowPopOver] = useState(false);
  const [overlayTimeout, setOverlayTimeout] = useState(null);

  function onClick() {
    CopyValue(props?.value);
    setShowPopOver(true);

    setOverlayTimeout(setTimeout(() => setShowPopOver(false), 1000));
  }

  useEffect(() => {
    return () => clearTimeout(overlayTimeout);
  }, []);

  return(
    <CopyButtonView
      onClick={onClick}
      showPopOver={showPopOver}
      {...props}
    />
  );
}
import { useState } from "react";

import ConnectGithubAccountView from "./view";

interface ConnectGithubAccountProps {
  show: boolean;
  onCloseClick: () => void;
  onOkClick: () => void;
}

export default function ConnectGithubAccount({
  show,
  onOkClick,
  onCloseClick,
}: ConnectGithubAccountProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  function handleConnectGithub() {
    setIsExecuting(true);
    onOkClick();
  }

  return (
    <ConnectGithubAccountView
      show={show}
      onCloseClick={onCloseClick}
      onOkClick={handleConnectGithub}
      isLoading={isExecuting}
    />
  );
}

import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import GithubConnectionState from "components/connections/github-connection-state/controller";
import {RemoveGithubAccount} from "components/profile/remove-github-modal";

import {useAppState} from "contexts/app-state";

import {useAuthentication} from "x-hooks/use-authentication";

export default function ConnectGithubSetup() {
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const {state} = useAppState();
  const { signOut } = useAuthentication();

  return(
    <div className="content-wrapper border-top-0 p-3">
      <Row>
        <Col>
          <GithubConnectionState handleClickDisconnect={() => setShowRemoveModal(true)} />
        </Col>
      </Row>

      <RemoveGithubAccount
        show={showRemoveModal}
        githubLogin={state.currentUser?.login}
        walletAddress={state.currentUser?.walletAddress}
        onCloseClick={() => setShowRemoveModal(false)}
        disconnectGithub={signOut}
      />
    </div>
  );
}
import {Col, Row} from "react-bootstrap";
import GithubConnectionState from "../github-connection-state";
import {RemoveGithubAccount} from "../profile/remove-github-modal";
import {useState} from "react";
import {useAuthentication} from "../../x-hooks/use-authentication";
import {useAppState} from "../../contexts/app-state";

export default function ConnectGithubSetup() {

  const {state} = useAppState();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const {disconnectGithub} = useAuthentication()


  return <div className="content-wrapper border-top-0 p-3">
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
      disconnectGithub={disconnectGithub}
    />

  </div>
}
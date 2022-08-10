import { useContext, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useRouter } from "next/router";

import InfoIconEmpty from "assets/icons/info-icon-empty";

import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { toastError } from "contexts/reducers/add-toast";

import useApi from "x-hooks/use-api";

interface RemoveGithubAccountProps {
  show: boolean;
  githubLogin: string;
  walletAddress: string;
  onCloseClick: () => void;
  disconnectGithub: () => void;
}

function RemoveGithubAccount({
  show,
  githubLogin,
  walletAddress,
  onCloseClick,
  disconnectGithub
} : RemoveGithubAccountProps) {
  const router = useRouter();
  const [isExecuting, setIsExecuting] = useState(false);

  const { resetUser } = useApi();
  const { dispatch } = useContext(ApplicationContext);
  
  const SpanPrimary = ({ text }) => <span className="text-primary">{text}</span>;
  const WarningSpan = ({ text}) => 
    <Row className="p family-Regular font-weight-medium svg-warning text-warning border-radius-4 mt-2">
      <span>
        <span className="mr-1">
          <InfoIconEmpty width={12} height={12} />
        </span>
        {text}
      </span>
    </Row>;

  function handleClickRemove() {
    setIsExecuting(true);

    resetUser(walletAddress, githubLogin)
      .then(() => {
        return disconnectGithub();
      })
      .then(() => router.push("/connect-account"))
      .catch(error => {
        if (error?.response?.status === 409) {
          const message = {
            LESS_THAN_7_DAYS: "Last account change was less than 7 days ago",
            PULL_REQUESTS_OPEN: "There is pull requests open for this account"
          };

          dispatch(toastError(message[error.response.data], "Failed to remove account"));
        } else 
          dispatch(toastError("Check the requirements", "Failed to remove account"));
        setIsExecuting(false);
      })
  }

  return(
    <Modal
      show={show}
      okLabel="Remove"
      okColor="danger"
      cancelLabel="Cancel"
      title="Remove Github Account"
      onCloseClick={onCloseClick}
      onOkClick={handleClickRemove}
      isOkActionExecuting={isExecuting}
    >
      <Row>
        <Col>
          <Row className="text-center mb-4">
            <span className="family-Regular font-weight-medium text-white">
              Remove <SpanPrimary text={githubLogin} /> account from the wallet <SpanPrimary text={walletAddress} />
            </span>
          </Row>

          <WarningSpan
            text="The account can only be changed again after seven days"
          />

          <WarningSpan
            text="There must be no open pull requests on bounties for this account"
          />
        </Col>
      </Row>
    </Modal>
  );
}

export { RemoveGithubAccount };
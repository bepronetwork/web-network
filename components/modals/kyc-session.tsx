import {useEffect, useState} from 'react';
import {Button, Col, Row} from 'react-bootstrap';

import Synaps from '@synaps-io/react-verify'

import {ContextualSpan} from "components/contextual-span";
import Modal from 'components/modal';
import ReadOnlyButtonWrapper from 'components/read-only-button-wrapper';
import Translation from "components/translation";

import {useAppState} from 'contexts/app-state';
import {changeCurrentUserKycSession} from 'contexts/reducers/change-current-user';

import { useValidateKycSession } from 'x-hooks/api/kyc';

export function KycSessionModal() {
  const [show, setShow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timer, setTimer] = useState(null);

  const {state, dispatch} = useAppState()

  const session = state?.currentUser?.kycSession;
  const isVerified = session?.status === "VERIFIED";

  function handlerValidateSession() {
    if (session?.session_id)
      useValidateKycSession(session?.session_id)
        .then((data) => {
          dispatch(changeCurrentUserKycSession(data))
        })
  }

  function updateSessionStateTimer() {
    let _timer;

    if (!timer)
      _timer = setInterval(() => handlerValidateSession(), 3000);
    if (!show)
      clearInterval(_timer);

    setTimer(_timer);
  }

  useEffect(updateSessionStateTimer, [show])

  // useEffect(getCurrentStep,[bountyMissSteps])
  useEffect(handlerValidateSession, [show])

  return <>
    <Row className="mb-3">
      <h6><Translation ns="bounty" label="kyc.label"/></h6>
      <span className={`p-small rans ${isVerified ? 'text-success' : 'text-gray'}`}>
          {state?.currentUser?.kycSession?.status}
      </span>
    </Row>
    <Row>
      <Col>
        <ReadOnlyButtonWrapper>
          {
            state?.currentUser?.kycSession?.status !== "VERIFIED"
              ? <Button
                color="danger"
                className="read-only-button me-1"
                onClick={() => setShow(true)}>
                <Translation ns="bounty" label="kyc.identify-kyc"/>
              </Button>
              : null
          }


          <Modal show={show} onCloseClick={() => setShow(false)} scrollable={false}
                 footer={
            <div className="d-flex justify-content-end"><Button onClick={() => setShow(false)}>Close</Button></div>}>
            <div className='d-flex flex-column align-items-center justify-content-center'>
              {isLoading ? <span className="spinner-border spinner-border-md"/> : null}
              {session ? (
                <>
                  <Synaps
                    sessionId={session?.session_id}
                    className={`${isLoading ? 'd-none' : ''} kyc-modal-body`}
                    onReady={() => setIsLoading(false)}
                    onFinish={() => setShow(false)}
                    service={'individual'}
                    lang={'en'}
                  />
                </>
              ) : null}
              {
                state?.currentUser?.kycSession?.status === "VERIFIED"
                  ? <ContextualSpan className="mt-3 mbn-3" context={"success"}>
                      <Translation ns="bounty"
                                   label="kyc.identified"/></ContextualSpan>
                  : null
              }
            </div>
          </Modal>
        </ReadOnlyButtonWrapper>
      </Col>
    </Row>
  </>
}

export default KycSessionModal;

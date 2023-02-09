import {useEffect, useState} from 'react';
import {Button, Col, Row} from 'react-bootstrap';

import Synaps from '@synaps-io/react-verify'

import Modal from 'components/modal';
import ReadOnlyButtonWrapper from 'components/read-only-button-wrapper';
import Translation from "components/translation";

import {useAppState} from 'contexts/app-state';
import {changeCurrentUserKycSession} from 'contexts/reducers/change-current-user';


import {Tier} from 'types/settings';

import useApi from 'x-hooks/use-api';

export function KycSessionModal() {
  const [show, setShow] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<Tier>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { validateKycSession } = useApi()
  const { state, dispatch } = useAppState()

  const session = state?.currentUser?.kycSession
  const bountyMissSteps = state?.currentBounty?.kycSteps
  
  function handlerValidateSession() {
    if(session?.session_id && 
      (session?.status !== 'VERIFIED' || state?.currentBounty?.kycSteps?.length))
      validateKycSession(session?.session_id)
        .then((data) => {
          dispatch(changeCurrentUserKycSession(data))
        })
  }

  function getCurrentStep(){
    if(bountyMissSteps?.length)
      setCurrentTier(bountyMissSteps[0])
  }
  
  useEffect(() => {
    if(!show) return

    const intervalId = setInterval(handlerValidateSession, 30000) // 30 seconds
  
    return () => clearInterval(intervalId);
  }, [show, session?.status])

  useEffect(getCurrentStep,[bountyMissSteps])
  useEffect(handlerValidateSession,[show])

  if(!session) return null

  return <>
    <Row className="mb-3">
      <h6><Translation ns="bounty" label="kyc.label" /></h6>
      <span className="p-small text-gray trans">{state?.currentUser?.kycSession?.status}</span>
    </Row>
    <Row>
      <Col>
        <ReadOnlyButtonWrapper>
          <Button
            color="danger"
            className="read-only-button me-1"
            disabled={state?.currentUser?.kycSession?.status === "VERIFIED"}
            onClick={() => setShow(true)}>
            <Translation ns="bounty" label="kyc.identify-kyc" />
          </Button>

          <Modal show={show} onCloseClick={() => setShow(false)} scrollable={false}>
            <div className='d-flex flex-column align-items-center justify-content-center'>
              {isLoading ? <span className="spinner-border spinner-border-md" /> : null}
              {session ? (
                <>
                  <Synaps
                    sessionId={session?.session_id}
                    tier={+currentTier?.id || null}
                    className={`${isLoading ? 'd-none' : ''} kyc-modal-body`}
                    onReady={() => setIsLoading(false)}
                    onFinish={() => setShow(false)}
                    service={'individual'}
                    lang={'en'}
                  />
                </>
              ): null}
            </div>
          </Modal>
        </ReadOnlyButtonWrapper>
      </Col>
    </Row>
  </>
}

export default KycSessionModal;

import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import Synaps from '@synaps-io/react-verify'


import Modal from 'components/modal';
import ReadOnlyButtonWrapper from 'components/read-only-button-wrapper';
import Translation from "components/translation";

import { useAppState } from 'contexts/app-state';
import { changeCurrentUserKycSession } from 'contexts/reducers/change-current-user';


import useApi from 'x-hooks/use-api';

export function KycSession() {
  const [show, setShow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { validateKycSession } = useApi()
  const { state, dispatch } = useAppState()

  const session = state?.currentUser?.kyc

  function handlerValidateSession() {
    if(session?.session_id && session?.status !== 'VERIFIED')
      validateKycSession(session?.session_id)
        .then((data) => {
          if(session.status !== data.status){
            dispatch(changeCurrentUserKycSession(data))
          }
        }).finally(()=> setIsLoading(false))
    else
    setIsLoading(false)
  }

  useEffect(handlerValidateSession,[show])

  if(!session)
    return <></>

  return (
    <ReadOnlyButtonWrapper>
      <Button
        color="danger"
        className="read-only-button me-1"
        onClick={() => setShow(true)}
      >
        <Translation ns="bounty" label="kyc.identify-to-start" />
      </Button>

      <Modal show={show} onCloseClick={() => setShow(false)}
      >
        <div className='d-flex flex-column align-items-center justify-content-center'>
          {isLoading  ? <span className="spinner-border spinner-border-md" /> : null}
          {session && !isLoading ? <Synaps
            sessionId={session?.session_id}
            service={'individual'}
            lang={'en'}
          /> : null}
        </div>
      </Modal>
    </ReadOnlyButtonWrapper>
  )
}

export default KycSession;
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import Synaps from '@synaps-io/react-verify'


import Modal from 'components/modal';
import ReadOnlyButtonWrapper from 'components/read-only-button-wrapper';
import Translation from "components/translation";

import { useAppState } from 'contexts/app-state';

import useApi from 'x-hooks/use-api';

export function KYC() {
  const [show, setShow] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { getKycSession } = useApi()
  const { state } = useAppState()


  useEffect(() => {
    if (!show) return
    getKycSession()
      .then(({ session_id }) => {
        setSessionId(session_id)
        setShow(true)
      })
  }, [show])


  return (
    <ReadOnlyButtonWrapper>
      <Button
        color="danger"
        className="read-only-button me-1"
        onClick={() => setShow(true)}
      >
        <Translation ns="bounty" label="kyc.validation" />
      </Button>

      <Modal show={show} onCloseClick={() => setShow(false)}>
        <div className='d-flex align-items-center justify-content-center'>
          <Synaps
            sessionId={sessionId}
            service={'individual'}
            lang={'en'}
            tier={2363}
            onReady={() => console.log('component ready')}
            onFinish={() => console.log('user finish process')}
            color={{
              primary: '212b39',
              secondary: 'ffffff'
            }}
          />
        </div>
      </Modal>
    </ReadOnlyButtonWrapper>
  )
}

export default KYC;
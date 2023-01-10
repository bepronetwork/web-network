import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import Synaps from '@synaps-io/react-verify'
import { useTranslation } from 'next-i18next';

import Modal from 'components/modal';
import ReadOnlyButtonWrapper from 'components/read-only-button-wrapper';
import Translation from "components/translation";

import { useAppState } from 'contexts/app-state';
import { changeCurrentUserKycSession } from 'contexts/reducers/change-current-user';


import { Tier } from 'types/settings';

import useApi from 'x-hooks/use-api';

export function KycSession() {
  const [show, setShow] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<Tier>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const {t} = useTranslation(["bounty"]);
  
  const { validateKycSession } = useApi()
  const { state, dispatch } = useAppState()

  const session = state?.currentUser?.kycSession
  
  function handlerValidateSession() {
    setIsLoading(true)
    if(session?.session_id && (session?.status !== 'VERIFIED' && state.currentBounty.kycSteps.length))
      validateKycSession(session?.session_id)
        .then((data) => {
          dispatch(changeCurrentUserKycSession(data))
        }).finally(()=> setIsLoading(false))
    else
    setIsLoading(false)
  }

  function getCurrentTier(){
    if(!state.currentBounty.kycSteps.length) return;
    setCurrentTier(state.currentBounty.kycSteps[0])
  }

  useEffect(getCurrentTier,[state.currentBounty.kycSteps])
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
        title={t("bounty:kyc.steps", {
          current:  (state.currentBounty.data.kycTierList.length - state.currentBounty.kycSteps.length) + 1,
          total: state.currentBounty.data.kycTierList.length
        })}
        footer={
          <Button
            color="danger"
            className="read-only-button me-1"
            onClick={handlerValidateSession}
          >
            <Translation ns="bounty" label="kyc.refresh" />
          </Button>
        }
      >
        <div className='d-flex flex-column align-items-center justify-content-center'>
          {isLoading || !currentTier  ? <span className="spinner-border spinner-border-md" /> : null}
          {session && !isLoading ? (
            <>
              <Synaps
              sessionId={session?.session_id}
              tier={+currentTier.id || null}
              onFinish={() => setShow(false)}
              service={'individual'}
              lang={'en'}
            /> 
          </>
          ): null}
        </div>
      </Modal>
    </ReadOnlyButtonWrapper>
  )
}

export default KycSession;
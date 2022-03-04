import { setCookie } from 'nookies'
import { signIn } from 'next-auth/react'

import Modal from '@components/modal'
import Button from '@components/button'
import { useContext } from 'react'
import { ApplicationContext } from '@contexts/application'

export default function UpdateGithubTokenModal({
  redirectTo,
  description,
  isVisible = false,
  setVisible = (show: boolean) => {}
}) {
  const {
    state: { currentAddress }
  } = useContext(ApplicationContext)

  function handleClose() {
    setVisible(false)
  }

  function handleConfirm() {
    setCookie(null, `updated-github-token:${currentAddress}`, 'true', {
      maxAge: 24 * 60 * 60,
      path: '/'
    })

    return signIn('github', { callbackUrl: redirectTo })
  }

  return (
    <Modal
      show={isVisible}
      title={`Update your Github Token`}
      centerTitle
      onCloseClick={handleClose}
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column">
          <p className="caption-small text-gray">{description}</p>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <Button color="primary" onClick={handleConfirm}>
            <span>Update now</span>
          </Button>

          <Button color="dark-gray" onClick={handleClose}>
            <span>Cancel</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

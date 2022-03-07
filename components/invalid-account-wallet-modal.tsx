import ErrorMarkIcon from '@assets/icons/errormark-icon'
import Modal from '@components/modal'
import { truncateAddress } from '@helpers/truncate-address'
import Avatar from './avatar'
import Button from './button'
import GithubImage from './github-image'
import metamaskLogo from '@assets/metamask.png'
import Image from 'next/image'

export default function InvalidAccountWalletModal({ isVisible, user }) {
  return (
    <Modal
      centerTitle
      size="lg"
      show={isVisible}
      title={"Github Account and Wallet don't match"}
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
          <p className="caption-small text-gray">
            Please, login to the Github account previously associated to this wallet.
          </p>
        </div>

        <div className="row gx-3 connect-account">
          <div className="col-6">
            <div
              className={`button-connect border bg-dark border-danger d-flex justify-content-between p-3 align-items-center`}
            >
              <div>
                <Avatar src={user?.image} userLogin={user?.login || `null`} />{' '}
                <span className="ms-2">{user?.name}</span>
              </div>

              <ErrorMarkIcon />
            </div>
          </div>
          <div className="col-6">
            <div
              className={`button-connect border bg-dark border-danger d-flex justify-content-between p-3 align-items-center border border-danger`}
            >
              <div>
                <Image src={metamaskLogo} width={15} height={15} />{' '}
                <span className="ms-2">
                  {user?.address && truncateAddress(user?.address)}
                </span>
              </div>
              <ErrorMarkIcon />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

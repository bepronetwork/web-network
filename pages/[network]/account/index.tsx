import React, { useContext, useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { GetServerSideProps } from 'next/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Modal from '@components/modal'
import Account from '@components/account'
import ListIssues from '@components/list-issues'
import MarkedRender from '@components/MarkedRender'
import IssueListItem from '@components/issue-list-item'

import { ApplicationContext } from '@contexts/application'

import { formatNumberToCurrency } from '@helpers/formatNumber'

import { IssueData } from '@interfaces/issue-data'

import { toastError } from '@reducers/add-toast'

import useMergeData from '@x-hooks/use-merge-data'
import usePendingIssue from '@x-hooks/use-pending-issue'
import useNetwork from '@x-hooks/use-network'

export default function MyIssues() {
  const {
    dispatch,
    state: { githubLogin, currentAddress }
  } = useContext(ApplicationContext)
  const [pendingIssues, setPendingIssues] = useState<IssueData[]>([])
  const [pendingIssue, { updatePendingIssue, treatPendingIssue }] =
    usePendingIssue()
  const { t } = useTranslation(['common', 'bounty'])

  const { getPendingFor } = useMergeData()
  const { network } = useNetwork()

  function getPendingIssues() {
    if (!currentAddress) return

    getPendingFor(currentAddress, network?.name).then((pending) =>
      setPendingIssues(pending.rows)
    )
  }

  function createPendingIssue() {
    treatPendingIssue().then((result) => {
      if (!result) return dispatch(toastError(t('errors.failed-update-bounty')))

      updatePendingIssue(null)
      getPendingIssues()
    })
  }

  useEffect(getPendingIssues, [currentAddress])

  return (
    <Account>
      <div className="container p-footer">
        <div className="row justify-content-center">
          {(pendingIssues?.length && (
            <div className="col-md-10">
              <h4 className="mb-4 text-capitalize">{`${t(
                'bounty:status.pending'
              )} ${t('bounty:label_other')}`}</h4>
              {pendingIssues.map((issue) => (
                <IssueListItem
                  issue={issue}
                  xClick={() => updatePendingIssue(issue)}
                />
              ))}
              <hr />
              <Modal
                title={t('modals.set-bounty-draft.title')}
                show={!!pendingIssue}
                centerTitle={true}
                okLabel={t('actions.update')}
                cancelLabel={t('actions.cancel')}
                titlePosition="center"
                className="max-height-body modal-md"
                onOkClick={() => createPendingIssue()}
                onCloseClick={() => updatePendingIssue(null)}
              >
                <h4 className="text-white mb-4">{pendingIssue?.title}</h4>
                <div className="bg-dark-gray p-3 rounded-5 ">
                  <MarkedRender source={pendingIssue?.body} />
                </div>
                <div className="bg-dark-gray w-100 text-center mt-4 rounded-5 py-3">
                  <div className="caption-small fs-smallest text-uppercase text-white">
                    {t('misc.reward')}
                  </div>
                  <h4 className="mb-0 text-uppercase">
                    <span className="text-white">
                      {formatNumberToCurrency(pendingIssue?.amount)}
                    </span>{' '}
                    <span className="text-primary">{t('$bepro')}</span>
                  </h4>
                </div>
              </Modal>
            </div>
          )) ||
            ``}

          <ListIssues creator={githubLogin || 'not-connected'} />
        </div>
      </div>
    </Account>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, [
        'common',
        'bounty',
        'pull-request',
        'connect-wallet-button',
        'custom-network'
      ]))
    }
  }
}

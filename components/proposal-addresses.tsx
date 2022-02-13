import { GetStaticProps } from 'next'
import React from 'react';
import {formatNumberToCurrency} from '@helpers/formatNumber';
import { useTranslation } from 'next-i18next';
import { truncateAddress } from '@helpers/truncate-address';

export default function ProposalAddresses({ addresses, currency = `oracles` }) {
    const { t } = useTranslation('proposal')

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-4 pb-0 pt-4">
                        <h3 className="caption-large pb-4">{t('addresses', { count: addresses?.length })}</h3>
                        {addresses?.length > 0 && addresses.map((item, index) => (
                            <div key={index} className="content-list-item border-bottom border-dark d-flex justify-content-between align-items-center">
                                <p className="caption-small mb-0 text-white">{truncateAddress(item.address)}</p>
                                <p className="caption-small color-purple mb-0">{formatNumberToCurrency(item.oracles)} <span className="text-blue">{currency}</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}

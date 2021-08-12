import { GetStaticProps } from 'next'
import React from 'react';

export default function ProposalAddresses({ addresses }) {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-4 pb-0">
                        <h3 className="smallCaption pb-3">{addresses?.length} addresses</h3>
                        {addresses.map((item, index) => (
                            <div key={index} className="content-list-item d-flex justify-content-between align-items-center">
                                <p className="p-small mb-0">{item.address}</p>
                                <p className="smallCaption color-purple mb-0">{item.oracles} oracles</p>
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

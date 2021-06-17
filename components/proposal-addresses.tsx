import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

export default function ProposalAddresses() {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-4 pb-0">
                        <h3 className="smallCaption pb-3">3 addresses</h3>
                        <div className="content-list-item d-flex justify-content-between align-items-center">
                            <p className="p-small mb-0">0xE1...Zr7u</p>
                            <p className="smallCaption color-purple mb-0">150 oracles</p>
                        </div>
                        <div className="content-list-item d-flex justify-content-between align-items-center">
                            <p className="p-small mb-0">0xE1...Zr7u</p>
                            <p className="smallCaption color-purple mb-0">150 oracles</p>
                        </div>
                        <div className="content-list-item d-flex justify-content-between align-items-center">
                            <p className="p-small mb-0">0xE1...Zr7u</p>
                            <p className="smallCaption color-purple mb-0">150 oracles</p>
                        </div>
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

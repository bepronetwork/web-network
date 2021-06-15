import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

export default function IssueDraftProgress() {
    return (
        <div className="container mt-up">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-4">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <div className="d-flex flex-column">
                                    <h3 className="h4 mb-3"><span className="color-purple">300</span> / 600 Oracles</h3>
                                    <ProgressBar variant="info" now={40} />
                                </div>
                            </div>
                            <div className="col-md-3 justify-content-center">
                                <button className="btn btn-md btn-trans w-100">View all addresses</button>
                            </div>
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

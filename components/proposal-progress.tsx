import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

export default function ProposalProgress() {
    return (
        <div className="container mt-up">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper p-0 overflow-hidden mb-4">
                        <div className="d-flex align-items-center">
                            <div className="user-block-progress progress-3 d-flex flex-column align-items-center w-25">
                                <img className="avatar circle-2 mb-1" src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" />
                                <p className="p-small mb-0">20% @AndMoniz</p>
                            </div>
                            <div className="user-block-progress progress-2 d-flex flex-column align-items-center w-25">
                                <img className="avatar circle-2 mb-1" src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" />
                                <p className="p-small mb-0">30% @AndMoniz</p>
                            </div>
                            <div className="user-block-progress progress-1 d-flex flex-column align-items-center w-50">
                                <img className="avatar circle-2 mb-1" src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg" alt="" />
                                <p className="p-small mb-0">50% @AndMoniz</p>
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

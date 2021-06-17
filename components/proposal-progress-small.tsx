import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';

export default function ProposalProgressSmall() {
    return (
        <div className="d-flex align-items-center">
            <div className="user-block-progress progress-3 d-flex flex-column align-items-center w-25">
                <p className="p-small mb-0">20% @AndMoniz</p>
            </div>
            <div className="user-block-progress progress-2 d-flex flex-column align-items-center w-25">
                <p className="p-small mb-0">30% @AndMoniz</p>
            </div>
            <div className="user-block-progress progress-1 d-flex flex-column align-items-center w-50">
                <p className="p-small mb-0">50% @AndMoniz</p>
            </div>
        </div>
    )
}

export const getStaticProps: GetStaticProps = async () => {
    return {
        props: {}
    }
}

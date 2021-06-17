import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function IssueComments() {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className="smallCaption mb-0">3 comments</h3>
                            <button className="btn btn-md btn-opac">Reply on github</button>
                        </div>
                        <div className="content-wrapper child mb-3">
                            <p className="p-small trans">@aTavares 3 days ago</p>
                            <p className="p-small">Are you sure you got the first line right?</p>
                        </div>
                        <div className="content-wrapper child mb-3">
                            <p className="p-small trans">@sgoia 10 days ago</p>
                            <p className="p-small">I am working on this.</p>
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

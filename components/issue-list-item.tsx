import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueAvatars from './issue-avatars';

export default function IssueListItem() {


    return (
        <div className="bg-shadow list-item rounded p-4 mb-3">
            <div className="row align-center">
                <div className="col-md-10 mb-3 mb-md-0">
                    <h4 className="h4 text-truncate">
                        <span className="trans">#3</span> Remove all getContract functions
                    from Application and instead functions from Application and instead</h4>
                    <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                        <span className="status blue mr-3 mt-1">In progress</span>
                        <span className="p-small trans mr-3 mt-1">2 comments</span>
                        <span className="p-small trans mr-3 mt-1">1 hour ago</span>
                        <span className="p-small trans mr-3 mt-1">by @skyteam</span>
                    </div>
                </div>
                <div className="col-md-2 my-auto text-center">
                    <span className="caption trans">10K $BEPRO</span>
                    <IssueAvatars></IssueAvatars>
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

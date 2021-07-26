import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueAvatars from './issue-avatars';
import CreateProposal from "./create-proposal";
import StartWorking from "./start-working";
import OpenIssue from "./open-issue";

export default function PageActions() {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <h4 className="h4">Details</h4>
                        <div className="d-flex align-items-center">
                            {/*<IssueAvatars></IssueAvatars>*/}
                            <button className="btn btn-md btn-opac mr-1">
                              View on github
                            </button>
                            <CreateProposal />
                            <StartWorking />
                            <OpenIssue />
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

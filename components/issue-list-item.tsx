import { GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react';
import IssueAvatars from './issue-avatars';

export interface IIssue {
    body: string,
    createdAt: Date,
    developers: [],
    githubId: string,
    issueId: string,
    numberOfComments: number,
    state: string,
    title: string,
}
export default function IssueListItem({issue = null}:{issue?: IIssue}) {


    return (
        <div className="bg-shadow list-item rounded p-4 mb-3">
            <div className="row align-center">
                <div className="col-md-10 mb-3 mb-md-0">
                    <h4 className="h4 text-truncate">
                        <span className="trans">#{issue?.githubId}</span> {issue?.title}</h4>
                    <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                        <span className="status blue mr-3 mt-1">{issue?.state}</span>
                        <span className="p-small trans mr-3 mt-1">{issue?.numberOfComments} comments</span>
                        <span className="p-small trans mr-3 mt-1">{issue?.createdAt}</span>
                        <span className="p-small trans mr-3 mt-1">by @missing</span>
                    </div>
                </div>
                <div className="col-md-2 my-auto text-center">
                    <span className="caption trans">MISSING $BEPRO</span>
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

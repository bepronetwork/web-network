import { GetStaticProps } from 'next'
import { useRouter } from 'next/router';
import React, { useContext } from 'react';
import { formatDate } from '@helpers/formatDate';
import IssueAvatars from './issue-avatars';
import {IssueData} from '@interfaces/issue-data';
import { ApplicationContext } from '@contexts/application';
import { IssueState } from '@interfaces/issue-data'
import {formatNumberToNScale} from '@helpers/formatNumber';
import Avatar from "components/avatar";

export default function IssueListItem({issue = null}:{issue?: IssueData}) {
    const router = useRouter()

    function handleColorState (state: IssueState) {
        switch(state.toLowerCase()) {
            case "draft": {
                return "gray"
            }
            case "open":{
                return "blue"
            }
            case "in progress":{
                return "blue"
            }
            case "canceled":{
                return "dark-gray"
            }
            case "closed":{
                return "dark-gray"
            }
            case "ready":{
                return "success"
            }
            case "done":{
                return "success"
            }
            case "disputed":{
                return "danger"
            }
            // REVIEW: redeem not exist in figma
            case "redeemed":{
                return "blue"
            }
            default: {
                return "blue"
            }
        }
    }

   function replaceRedeem(issueState: IssueState): IssueState{
        return issue?.state === 'redeemed' ? 'closed' : issueState;
   }

   function GhInfo(color, value) {
    return <div className={`bg-transparent smallCaption text-uppercase px-1 rounded border border-2 border-${color} text-${color} text-uppercase fs-smallest`}>
            <strong>{value}</strong>
        </div>
    }
  

    return (
            <div className="bg-shadow list-item rounded p-4 mb-3" onClick={() => {
                router.push({
                    pathname: '/issue',
                    query: { id: issue?.githubId },
                })
            }}>
                <div className="row align-center">
                    <div className="col-md-10 mb-3 mb-md-0">
                        <h4 className="h4 text-truncate">
                            <span className="trans me-1">#{issue?.githubId}</span>
                            {issue?.title.length > 61
                              ? issue?.title.substring(0,61)+"..."
                              : issue?.title
                            }
                        </h4>
                        <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start">
                            <span className={`status ${handleColorState(replaceRedeem(issue?.state))} mr-2 mt-1`}>{replaceRedeem(issue?.state)}</span>
                            <span className="p-small trans mr-2 mt-1">{issue?.numberOfComments} comments</span>
                            <span className="p-small trans mr-2 mt-1">{issue != null && formatDate(issue?.createdAt)}</span>
                            {issue?.repo && <span className="p-small trans mr-2 mt-1 text-uppercase">{GhInfo('blue', issue?.repo)}</span>}
                            <span className="p-small trans mr-2 mt-1">by</span>
                            <span className="p-small trans mr-2 mt-1">{GhInfo('gray', `@${issue?.creatorGithub}`)}</span>
                            <Avatar className="mr-2" userLogin={issue.creatorGithub} />
                            {issue?.dueDate && <span className="p-small text-warning mr-2 mt-1">{issue?.dueDate}</span>}
                        </div>
                    </div>
                    <div className="col-md-2 my-auto text-center">
                        <span className="caption trans text-white text-opacity-1">{formatNumberToNScale(issue?.amount || 0)} <label className="text-uppercase text-blue">$BEPRO</label></span>
                        {(issue?.developers.length > 0) && <IssueAvatars users={issue?.developers}></IssueAvatars>}
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

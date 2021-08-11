import { GetStaticProps } from 'next'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { formatDate } from '../helpers/formatDate';
import IssueAvatars from './issue-avatars';
import {IssueData} from '../interfaces/issue-data';
import { BeproService } from '../services/bepro-service';

export default function IssueListItem({issue = null}:{issue?: IssueData}) {
    const router = useRouter()
    const [amount, setAmount] = useState<string>()

   function handleColorState (state: string) {
    switch(state.toLowerCase()) {
     case "draft": {
        return "gray"
     }
     case "in progress" || "open": {
        return "blue"
     }
     case "ready": {
        return "green"
     }
     default: {
        return "blue"
     }
    }
   }

   useEffect(() => {
    async function getIssueBeprosStaked(issueId: string){
        await BeproService.network.getIssueById({issueId})
            .then((issue) => setAmount(issue.tokensStaked))
            .catch((err)  => console.log('err ->', err))
    }
     getIssueBeprosStaked(issue?.issueId)
   },[issue])

    return (
            <div className="bg-shadow list-item rounded p-4 mb-3" onClick={() => {
                router.push({
                    pathname: '/issue',
                    query: { id: issue?.issueId },
                })
            }}>
                <div className="row align-center">
                    <div className="col-md-10 mb-3 mb-md-0">
                        <h4 className="h4 text-truncate">
                            <span className="trans me-1">#{issue?.githubId}</span>
                            {issue?.title.length > 61 ?
                            issue?.title.substring(0,61)+"..."
                            :
                            issue?.title
                            }
                        </h4>
                        <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                            <span className={`status ${handleColorState(issue?.state)} mr-3 mt-1`}>{issue?.state}</span>
                            <span className="p-small trans mr-3 mt-1">{issue?.numberOfComments} comments</span>
                            <span className="p-small trans mr-3 mt-1">{issue != null && formatDate(issue?.createdAt)}</span>
                            <span className="p-small trans mr-3 mt-1">{issue?.creatorGithub}</span>
                            {issue?.dueDate && <span className="p-small text-warning mr-3 mt-1">{issue?.dueDate}</span>}
                        </div>
                    </div>
                    <div className="col-md-2 my-auto text-center">
                        <span className="caption trans">{amount == "0" ? "MISSING" : amount } $BEPRO</span>
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

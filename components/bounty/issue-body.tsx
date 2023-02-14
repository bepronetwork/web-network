import Button from "components/button";
import CustomContainer from "components/custom-container";
import IssueDescription from "components/issue-description";
import IssueProposalProgressBar from "components/issue-proposal-progress-bar";

import { useAppState } from "contexts/app-state";

import IssueEditTag from "./issue-edit-tag";

export default function IssueBody({ isEditIssue }: { isEditIssue: boolean }) {
  const {state} = useAppState();

  if(state.currentUser?.walletAddress) 
    return (
        <div className="container mb-1">
          <div className="d-flex bd-highlight justify-content-center mx-2 px-4">
            <div className="ps-3 pe-0 ms-0 me-2 w-65 bd-highlight">
            <div className="content-wrapper mb-3">
                <IssueEditTag isEdit={isEditIssue} />
                <div className="container">
                  <IssueDescription 
                  description={state.currentBounty?.data?.body || ""} 
                  isEdit={isEditIssue}
                  />
                </div>
                <div className="d-flex flex-row justify-content-between mt-3">
                  <Button 
                    color="danger" 
                    onClick={() => {console.log('click')}} 
                    disabled={false}
                  >
                    <span>
                      cancel
                    </span>
                  </Button>

                  <Button
                      className="d-flex flex-shrink-0 w-40 btn-block"
                      onClick={() => {console.log('click')}} 
                      disabled={false}
                    >
                      <span>
                        save changes
                      </span>
                    </Button>

                </div>
            </div>
            </div>
            <div className="p-0 me-3 flex-shrink-0 w-25 bd-highlight">
              <div className="sticky-bounty">
                <IssueProposalProgressBar />
              </div>
            </div>
          </div>
        </div>
    ) 
      
  else return(
        <CustomContainer>
          <div className="content-wrapper mb-3">
            <IssueDescription description={state.currentBounty?.data?.body || ""} />
          </div>
        </CustomContainer>
  )
}
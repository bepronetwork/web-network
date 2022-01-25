import Avatar from "components/avatar";
import { GetStaticProps } from "next";
import { getTimeDifferenceInWords } from '@helpers/formatDate';
import GithubInfo from '@components/github-info';
import Translation from "./translation";

export default function IssueHero({ issue, state, amount }) {

  function renderCreator() {
    if(issue?.creatorGithub)
    return <div className="d-flex align-items-center">
        <Avatar className="mx-2" userLogin={issue.creatorGithub} /> <GithubInfo parent="hero" variant="user" label={[`@`, issue.creatorGithub].join(``)} />
        </div>
  }

  return (
    <div className="banner bg-bepro-blue mb-4">
      {console.log({issue})}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h1 className="text-capitalize h3">
                <Translation ns="bounty" label={`status.${state}`} /> <Translation ns="bounty" label={`label`} />
              </h1>
              <div className="row">
                <div className="col-md-9">
                  <div className="top-border">
                    <h4 className="mb-2">
                      #{issue?.githubId} {issue?.title}
                    </h4>
                    <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start">
                      <span className="caption-small mr-2 mt-1">
                        {renderCreator()}
                      </span>
                      <span className="caption-small mr-2 mt-1">
                        {(issue?.repository && (
                          <GithubInfo
                            parent="hero"
                            variant="repository"
                            label={issue?.repository?.githubPath}
                          />
                        )) ||
                          ``}
                      </span>
                        {issue.branch && (
                        <span className="caption-small mr-2 mt-1 text-white-50 text-uppercase">
                            <>
                              <Translation label={`branch`} />
                              <span className="text-white">:{issue.branch}</span>
                            </>
                        </span>
                        )}
                      <span className="caption-small mr-2 mt-1 text-white-50">
                        {issue && (
                          <>
                            <Translation
                              ns="bounty"
                              label={`status.opened-time`}
                              params={{
                                distance: getTimeDifferenceInWords(
                                  new Date(issue?.createdAt),
                                  new Date()
                                ),
                              }}
                            />
                          </>
                        )}
                      </span>
                      {issue?.dueDate && (
                        <span className="caption-small text-warning mr-3 mt-1">
                          {issue?.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="banner-highlight">
                    {amount && (
                      <h4 className="mb-0">
                        {amount || `&infin;`}
                        <span className="p-small">
                          <Translation label={`$bepro`} />
                        </span>
                      </h4>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

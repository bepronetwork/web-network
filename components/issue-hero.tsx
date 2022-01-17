import Avatar from "components/avatar";
import { GetStaticProps } from "next";
import { formatDate } from '@helpers/formatDate';
import GithubInfo from '@components/github-info';
import Translation from "./translation";

export default function IssueHero({ issue, state, amount }) {

  function renderCreator() {
    if(issue?.creatorGithub)
    return <div className="d-flex align-items-center">
          <span className="mr-2 text-white-50"><Translation label={'misc.by'} /></span> <GithubInfo parent="hero" variant="user" label={[`@`, issue.creatorGithub].join(``)} /> <Avatar className="mx-2" userLogin={issue.creatorGithub} />
        </div>
  }

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h1 className="text-capitalize h3"><Translation ns="bounty" label={`status.${state}`} /> <Translation ns="bounty" label={`label`} /></h1>
              <div className="row">
                <div className="col-md-9">
                  <div className="top-border">
                    <h4 className="mb-2">
                      #{issue?.githubId} {issue?.title}
                    </h4>
                    <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start">
                      <span className="p-small mr-3 mt-1 text-white-50">
                        {issue && formatDate(issue?.createdAt)}
                      </span>
                      <span className="p-small mr-2 mt-1">
                        {issue?.repository && <GithubInfo parent="hero" variant="repository" label={issue?.repository?.githubPath} /> || ``}
                      </span>
                      <span className="p-small mr-3 mt-1">
                        {renderCreator()}
                      </span>
                      {issue?.dueDate && (
                        <span className="p-small text-warning mr-3 mt-1">
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
                        <span className="p-small"> <Translation label={`$bepro`} /></span>
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

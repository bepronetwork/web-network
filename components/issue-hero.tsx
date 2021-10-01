import Avatar from "components/avatar";
import { GetStaticProps } from "next";
import { formatDate } from '@helpers/formatDate';

export default function IssueHero({ issue, state, amount }) {
  function GhInfo(color, value) {
    return <div className={`bg-transparent smallCaption text-uppercase px-1 rounded border border-2 border-${color} text-${color} text-opacity-1 text-center text-uppercase fs-smallest`}>
            <strong>{value}</strong>
        </div>
  }

  function renderCreator() {
    if(issue?.creatorGithub)
    return <div className="d-flex align-items-center">
          <span className="mr-2">by</span> {GhInfo('white',issue.creatorGithub)} <Avatar className="mx-2" userLogin={issue.creatorGithub} />
        </div>
  }

  return (
    <div className="banner bg-bepro-blue mb-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex flex-column">
              <h3 className="h4 trans text-capitalize mb-0">{state} issue</h3>
              <div className="row">
                <div className="col-md-9">
                  <div className="top-border">
                    <h1 className="h4 mb-2">
                      #{issue?.githubId} {issue?.title}
                    </h1>
                    <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start">
                      <span className="p-small trans mr-3 mt-1">
                        {issue && formatDate(issue?.createdAt)}
                      </span>
                      <span className="p-small trans mr-2 mt-1">
                      {issue?.repo && (<div className="bg-white smallCaption text-uppercase px-1 rounded border border-2 border-white bg-opacity-1 text-blue text-center text-uppercase fs-smallest">
                          <strong>{issue?.repo}</strong>
                      </div>)}
                      </span>
                      <span className="p-small trans mr-3 mt-1">
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
                      <h4 className="h4 mb-0">
                        {amount > 0 ? amount : "MISSING"}
                        <span className="p-small trans"> $BEPRO</span>
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

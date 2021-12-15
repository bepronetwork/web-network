import {GetServerSideProps, GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageHero from "@components/page-hero";
import ListIssues from '@components/list-issues';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';
import IssueFilters from '@components/issue-filters';
import useMergeData from '@x-hooks/use-merge-data';
import useRepos from '@x-hooks/use-repos';
import InternalLink from '@components/internal-link';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import LockedIcon from '@assets/icons/locked-icon';
import ReactSelect from '@components/react-select';
import Button from '@components/button';
import CloseIcon from '@assets/icons/close-icon';

type Filter = {
  label: string;
  value: string;
  emptyState: string;
};

type FiltersByIssueState = Filter[];

const filtersByIssueState: FiltersByIssueState = [
  {
    label: "All bounties",
    value: 'all',
    emptyState: 'Bounties not found'
  },
  {
    label: 'Open bounties',
    value: 'open',
    emptyState: 'Open bounties not found'
  },
  {
    label: 'Draft bounties',
    value: 'draft',
    emptyState: 'Draft bounties not found'
  },
  {
    label: 'Closed bounties',
    value: 'closed',
    emptyState: 'Closed bounties not found'
  }
];

export default function PageDevelopers() {
  const {dispatch, state: { loading }} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [filterByState, setFilterByState] = useState<Filter>(filtersByIssueState[0]);
  const mergedData = useMergeData();

  const page = usePage();
  const results = useCount();
  const router = useRouter();
  const {repoId, time, state} = router.query as {repoId: string; time: string; state: string};

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues);
  }

  function getIssues() {

    dispatch(changeLoadState(true))
    mergedData.getIssues({page, repoId, time, state})
                      .then(({rows, count}) => {
                        results.setCount(count);
                        return rows;
                      })
                      .then(updateIssuesList)
                      .catch((error) => {
                        console.error('Error fetching issues', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, [page, repoId, time, state]);

  return (<>
    <div>
      <PageHero title="Find bounties to work on"/>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="input-group  mb-3">
              <span className="input-group-text rounded-4 " id="inputGroup-sizing-sm"><LockedIcon/></span>
              <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm"/>
              <button className="bg-black border-transparent pe-3"  style={{
                borderTopRightRadius: ".5rem",
                borderBottomRightRadius: ".5rem",
              }}><CloseIcon width={10} height={10}/></button>  
              
                    
              <div className="d-flex flex-row ms-3">
                <span className="mediumInfo mr-1 mt-2 text-white-50">sort by</span>
                <ReactSelect />
              </div> 
              <Button transparent applyTextColor textClass="text-blue">
                Clear
              </Button>
              <IssueFilters />
              </div> 
            </div>   

          <ListIssues listIssues={issues} />
          {issues?.length !== 0 && (
              <Paginate
                count={results.count}
                onChange={(page) =>
                  router.push({
                    pathname: router.pathname,
                    query: {
                      page,
                      state,
                      time,
                      repoId,
                    },
                  })
                }
              />
            )}
          {issues?.length === 0 && !loading.isLoading ? (
            <div className="col-md-10">
              <NothingFound
                description={filterByState.emptyState}>
                <InternalLink href="/create-bounty" label="create one" uppercase />
              </NothingFound>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </>);
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common',])),
    },
  };
};

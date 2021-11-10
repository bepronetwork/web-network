import { GetStaticProps } from 'next'
import { useRouter } from 'next/router';
import InternalLink from './internal-link';

export default function ProposalHero({githubId, title, pullRequestId, authorPullRequest, createdAt, beproStaked}) {
    const router = useRouter();
    const { issueId: issueCID } = router.query;
    const [repoId, issueId] = (issueCID as string).split(`/`);
    return (
        <div className="banner bg-bepro-blue mb-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="d-flex flex-column">
                            <div className="d-flex align-items-center cursor-pointer text-truncate">
                                <InternalLink href={{ pathname:"/issue", query: { id: issueId, repoId }}} icon={<i className="ico-back me-2" />} label={`#${githubId} ${title}`} className="p-nm trans" iconBefore transparent />
                            </div>
                            <div className="row">
                                <div className="col-md-9">
                                    <div className="top-border">
                                        <h1 className="h4 mb-0">Pull Request #{pullRequestId} by @{authorPullRequest}</h1>
                                        <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                                            <span className="p-small mr-3 mt-1">Created {createdAt}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="banner-highlight">
                                        <h4 className="h4 mb-0">{beproStaked} <span className="p-small trans">$BEPRO</span></h4>
                                    </div>
                                </div>
                            </div>
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

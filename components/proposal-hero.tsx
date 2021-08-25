import { GetStaticProps } from 'next'
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ProposalHero({githubId, title, pullRequestId, authorPullRequest, createdAt, beproStaked}) {
    const router = useRouter();
    const { issueId } = router.query;
    
    return (
        <div className="banner bg-bepro-blue mb-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="d-flex flex-column">
                            <div className="d-flex align-items-center trans cursor-pointer">
                                <Link 
                                    href={{
                                        pathname:"/issue",
                                        query: { id: issueId }
                                    }}>
                                    <a>
                                        <i className="ico-back mr-2"></i>
                                    </a>
                                </Link>

                                <p className="p mb-0 text-truncate w-50">#{githubId} {title}</p>
                            </div>
                            <div className="row">
                                <div className="col-md-9">
                                    <div className="top-border">
                                        <h1 className="h4 mb-0">Pull Request #{pullRequestId} by @{authorPullRequest}</h1>
                                        <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                                            <span className="p-small trans mr-3 mt-1">Created {createdAt}</span>
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

import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function AccountHero({issuesCount = 0}, {issuesCount: number}) {
    return (
        <div className="banner bg-bepro-blue mb-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="d-flex flex-column">
                            <h1 className="h1 mb-0">My account</h1>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">{issuesCount}</h4>
                                        <span className="p-small">Issues</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">300.000</h4>
                                        <span className="p-small">Oracles</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">0</h4>
                                        <span className="p-small">Delegated oracles</span>
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

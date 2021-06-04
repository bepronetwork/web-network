import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function IssueHero() {
    return (
        <div className="banner bg-bepro-blue mb-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="d-flex flex-column">
                            <h3 className="h4 trans mb-0">Open issue</h3>
                            <div className="row">
                                <div className="col-md-9">
                                    <div className="stats">
                                        <h1 className="h4 mb-0">#7 Remove all getContract functions from Application and instead calling the Object directly</h1>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="stats">
                                        <h4 className="h4 mb-0">10K <span className="smallParagraph trans">$BEPRO</span></h4>
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

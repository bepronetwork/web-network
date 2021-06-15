import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function PageHero() {
    return (
        <div className="banner bg-bepro-blue mb-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <div className="d-flex flex-column">
                            <h1 className="h1 mb-0">Find issues to work</h1>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">10</h4>
                                        <span className="p-small">In progress</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">12</h4>
                                        <span className="p-small">Issues closed</span>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="top-border">
                                        <h4 className="h4 mb-0">
                                            120,300,000 <span className="smallCaption trans">$BEPRO</span>
                                        </h4>
                                        <span className="p-small">On network</span>
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

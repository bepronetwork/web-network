import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function IssueListItem() {
    return (
        <div className="bg-shadow list-item rounded p-4 mb-3">
            <div className="row align-center">
                <div className="col-md-10 mb-3 mb-md-0">
                    <h4 className="h4 text-truncate">
                        <span className="trans">#3</span> Remove all getContract functions
              from Application and instead functions from Application and
              instead
            </h4>
                    <div className="d-flex align-center flex-wrap justify-content-center justify-content-md-start">
                        <span className="status blue mr-3 mt-1">In progress</span>
                        <span className="smallParagraph trans mr-3 mt-1">2 comments</span>
                        <span className="smallParagraph trans mr-3 mt-1">1 hour ago</span>
                        <span className="smallParagraph trans mr-3 mt-1">by @skyteam</span>
                    </div>
                </div>
                <div className="col-md-2 my-auto text-center">
                    <span className="caption trans">10K $BEPRO</span>
                    <div className="avatar-list">
                        <img
                            className="avatar circle-3"
                            src="https://randomuser.me/api/portraits/men/78.jpg"
                            alt=""
                        />
                        <img
                            className="avatar circle-3"
                            src="https://uifaces.co/our-content/donated/gPZwCbdS.jpg"
                            alt=""
                        />
                        <img
                            className="avatar circle-3"
                            src="https://uifaces.co/our-content/donated/Xp0NB-TL.jpg"
                            alt=""
                        />
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

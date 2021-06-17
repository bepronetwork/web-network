import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function IssueDescription() {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-3">
                        <h3 className="smallCaption mb-3">DESCRIPTION</h3>
                        <p className="paragraph">
                            Change the architecture of Application.getContractType()<br></br><br></br>
                        Example<br></br>
                        Instead of using<br></br><br></br>
                        erc721Contract = app.getERC721Collectibles({ });<br></br><br></br>
                        to use<br></br>
                        import ERC721Collectibles from ...<br></br>
                        let erc721Contract = new ERC721Collectibles();<br></br>
                        </p>
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

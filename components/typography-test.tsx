import { GetStaticProps } from 'next'
import { useEffect, useState } from 'react';

export default function TypographyTest() {
    return (
        <div className="container">

            <div className="row justify-content-center">
                <div className="col-md-10 mb-5">
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Heading 1 / Use .h1</p>
                        <h1 className="h1">Build the future of DeFi Gaming</h1>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Heading 2 / Use .h2</p>
                        <h2 className="h2">Build the future of DeFi Gaming</h2>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Heading 3 / Use .h3</p>
                        <h3 className="h3">Build the future of DeFi Gaming</h3>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Heading 4 / Use .h4</p>
                        <h4 className="h4">Build the future of DeFi Gaming</h4>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Caption / Use .caption</p>
                        <p className="caption">Build the future of DeFi Gaming</p>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">
                            Small Caption / Use .smallCaption</p>
                        <p className="smallCaption">Build the future of DeFi Gaming</p>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">Paragraph / Use .p</p>
                        <p className="p w-50">
                            Use $BEPRO to propose new features, new products or to get technical
                support from the BEPRO.network engineers´ community.</p>
                    </div>
                    <div className="mb-3">
                        <p className="smallParagraph trans mb-0">
                            Small Paragraph / Use .smallParagraph</p>
                        <p className="smallParagraph w-50">
                            Use $BEPRO to propose new features, new products or to get technical
                support from the BEPRO.network engineers´ community.</p>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                        <div className="">
                            <p className="smallParagraph trans mb-2">.btn-primary</p>
                            <button className="btn btn-md btn-primary">Primary button</button>
                        </div>
                        <div className="">
                            <p className="smallParagraph trans mb-2">.btn-white</p>
                            <button className="btn btn-md btn-white">White button</button>
                        </div>
                        <div className="">
                            <p className="smallParagraph trans mb-2">.btn-trans</p>
                            <button className="btn btn-md btn-trans">Transparent button</button>
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

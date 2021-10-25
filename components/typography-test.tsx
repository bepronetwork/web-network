import { GetStaticProps } from 'next'

export default function TypographyTest() {
    return (
        <div className="container">

            <div className="row justify-content-center">
                <div className="col-md-10 mb-5">
                    <div className="mb-3">
                        <p className="p-small mb-0">Heading 1 / Use .h1</p>
                        <h1 className="h1">Build the future of DeFi Gaming</h1>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">Heading 2 / Use .h2</p>
                        <h2 className="h2">Build the future of DeFi Gaming</h2>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">Heading 3 / Use .h3</p>
                        <h3 className="h3">Build the future of DeFi Gaming</h3>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">Heading 4 / Use .h4</p>
                        <h4 className="h4">Build the future of DeFi Gaming</h4>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">Caption / Use .caption</p>
                        <p className="caption">Build the future of DeFi Gaming</p>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">
                            Small Caption / Use .smallCaption</p>
                        <p className="smallCaption">Build the future of DeFi Gaming</p>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">Paragraph / Use .p</p>
                        <p className="p w-50">
                            Use $BEPRO to propose new features, new products or to get technical
                support from the BEPRO.network engineers´ community.</p>
                    </div>
                    <div className="mb-3">
                        <p className="p-small mb-0">
                            Small Paragraph / Use .p-small</p>
                        <p className="p-small w-50">
                            Use $BEPRO to propose new features, new products or to get technical
                support from the BEPRO.network engineers´ community.</p>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                        <div className="d-flex flex-column">
                            <p className="p-small mb-2">.btn-primary</p>
                            <button className="btn btn-sm btn-primary mb-2">Primary button</button>
                            <button className="btn btn-primary mb-2">Primary button</button>
                            <button className="btn btn-md btn-primary mb-2">Primary button</button>
                            <button className="btn btn-lg btn-primary mb-2">Primary button</button>
                        </div>
                        <div className="d-flex flex-column">
                            <p className="p-small mb-2">.btn-white</p>
                            <button className="btn btn-sm btn-white mb-2">White button</button>
                            <button className="btn btn-white mb-2">White button</button>
                            <button className="btn btn-md btn-white mb-2">White button</button>
                            <button className="btn btn-lg btn-white mb-2">White button</button>
                        </div>
                        <div className="d-flex flex-column">
                            <p className="p-small mb-2">.btn-trans</p>
                            <button className="btn btn-sm btn-trans mb-2">Transparent button</button>
                            <button className="btn btn-trans mb-2">Transparent button</button>
                            <button className="btn btn-md btn-trans mb-2">Transparent button</button>
                            <button className="btn btn-lg btn-trans mb-2">Transparent button</button>
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

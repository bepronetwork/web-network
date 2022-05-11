import { GetStaticProps } from 'next'
import MarkedRender from '@components/MarkedRender';

export default function IssueDescription({ description }) {
    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-3">
                        <h3 className="smallCaption mb-3">DESCRIPTION</h3>
                        <div className="bg-dark-gray p-3 rounded">
                            <div className="p p-1">
                                <MarkedRender source={description} />
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

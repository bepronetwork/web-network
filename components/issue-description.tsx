import { GetStaticProps } from 'next'
import MarkedRender from '@components/MarkedRender'
import { useTranslation } from 'next-i18next'

export default function IssueDescription({ description }) {
    const { t } = useTranslation('common')

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="content-wrapper mb-3">
                        <h3 className="caption-large mb-3">{t('misc.description')}</h3>
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

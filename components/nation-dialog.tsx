import { kebabCase } from "lodash";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import BeProBlue from "@assets/icons/bepro-blue";
import Loading from 'components/loading'
import { COUNTRY_CODE_BLOCKED } from "../env";
import useApi from '@x-hooks/use-api';
import { useTranslation } from "next-i18next";

export default function NationDialog({ children }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBlock, setBlock] = useState<boolean>(false);
  const {getClientNation} = useApi();
  const { t } = useTranslation('common')
  const [country, setCountry] = useState<string>(String(t('modals.nation-dialog.your-country')));

  useEffect(() => {
    setIsLoading(true);
    getClientNation()
      .then((data)=>{
        if (COUNTRY_CODE_BLOCKED.indexOf(data.countryCode) === -1)
          return;

        setCountry(data.country || '');
        setBlock(true);

      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isBlock) {
    return (
      <div className="container-fluid vw-100 vh-100 bg-image bg-main-image">
        <Modal centered
               aria-labelledby={`${kebabCase("NationDialog")}-modal`}
               aria-describedby={`${kebabCase("NationDialog")}-modal`}
               id="nation-dialog-modal"
               show={true}>
          <Modal.Header>
            <Modal.Title>
              <BeProBlue width={40} height={40}/>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column mt-2 align-items-center text-whit">
              <p className="p text-white mb-2 text-center fs-9 white-space-wrap">
                {t('modals.nation-dialog.at-the-moment')}
              </p>
              <a target="_blank" href="https://www.bepro.network/terms-and-conditions"
                className="mb-2 text-center text-white-50 text-decoration-none text-uppercase fs-8">
                {t('modals.nation-dialog.excluded')}
              </a>
              <p className="p text-wrap mb-2 text-center fs-8">
                {t('modals.nation-dialog.further')}
              </p>
              <a className="family-inter text-uppercase text-blue-dark text-decoration-none fs-8" href="mailto: general@bepro.network">
              {t('modals.nation-dialog.email')}
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  if(isLoading) return <Loading show={isLoading} text={t('please-wait')} />

  return <>{children}</>;
}

import { kebabCase } from "lodash";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import BeProBlue from "@assets/icons/bepro-blue";
import Loading from 'components/loading'
import { COUNTRY_CODE_BLOCKED } from "../env";
import GithubMicroService from "@services/github-microservice";

export default function NationDialog({ children }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBlock, setBlock] = useState<boolean>(false);
  const [country, setCountry] = useState<string>("Your Country");

  useEffect(() => {
    setIsLoading(true);
    GithubMicroService.getClientNation()
      .catch((e) => {
        console.error(`Failed to fetch Nation; Blocking.`, e);
        return {countryCode: `US`};
      })
      .then(({countryCode, country})=>{
        if (COUNTRY_CODE_BLOCKED.indexOf(countryCode) === -1)
          return;

        setCountry(country || '');
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
               show={isBlock}>
          <Modal.Header>
            <Modal.Title>
              <BeProBlue width={40} height={40}/>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column mt-2 align-items-center text-whit">
              <p className="p text-white mb-2 text-center fs-9 white-space-wrap">
                At the moment BEPRO services and BEPRO Token{"\n "}(BEPRO) are
                not available in {country}
              </p>
              <a href="https://www.bepro.network/terms-and-conditions" 
                className="mb-2 text-center text-white-50 text-decoration-none text-uppercase fs-8">
                Excluded Jurisdictions.
              </a>
              <p className="p text-wrap mb-2 text-center fs-8">
                For further information please contact us on
              </p>
              <a className="family-inter text-uppercase text-blue-dark text-decoration-none fs-8" href="mailto: general@bepro.network">
                general@bepro.network
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }

  if(isLoading) return <Loading show={isLoading} text="Please wait"/>

  return <>{children}</>;
}

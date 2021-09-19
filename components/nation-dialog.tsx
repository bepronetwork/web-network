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
  const [country, setCountry] = useState<string>("");

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
              <BeProBlue />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex flex-column mt-2 align-items-center">
              <p className="family-inter p mb-2 text-center white-space-wrap text-white">
                At the moment BEPRO services and{"\n "}BEPRO Token (BEPRO) are
                not available in {country}
              </p>
              <span className="family-inter p mb-2 text-center ">
                Excluded Jurisdictions.
              </span>
              <p className="family-inter p mb-2 text-center text-white">
                For further information please contact us on
              </p>
              <a className="family-inter text-blue-dark" href="mailto: general@bepro.network">
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

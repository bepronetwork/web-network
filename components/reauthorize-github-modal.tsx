import Button from "components/button";
import Modal from "components/modal";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

export default function ReAuthorizeGithubModal() {
  const { 
    state:{
      show: {
        reAuthorizeGithub
      }
    } 
  } = useAppState();
  const { connectGithub } = useAuthentication();

  return (
    <Modal
      centerTitle
      show={reAuthorizeGithub}
      title="Reauthorize Github"
    >
      <p className="font-weight-medium text-center">
        Your github connection has expired. Please, reauthorize the session.
      </p>

      <Button
        onClick={connectGithub}
      >
        Reauthorize
      </Button>
    </Modal>
  );
}

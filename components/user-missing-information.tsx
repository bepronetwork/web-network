import { ApplicationContext } from "@contexts/application";
import { changeGithubHandle } from "@contexts/reducers/change-github-handle";
import useApi from "@x-hooks/use-api";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import Button from "./button";
import Modal from "./modal";

export default function UserMissingModal({ show }: { show: boolean }) {
  const [isVisible, setVisible] = useState<boolean>(show);
  const {
    dispatch,
    state: { currentAddress },
  } = useContext(ApplicationContext);
  const { removeUser } = useApi();
  const router = useRouter();

  function handleReconnectAcount() {
    removeUser(currentAddress)
      .then(() => {
        setVisible(false);
        dispatch(changeGithubHandle(""));
        router.push("/account");
      })
      .catch((err) => {
        console.log("err modal user->", err);
      });
  }

  function changeSetVisible() {
    setVisible(show);
  }

  useEffect(changeSetVisible, [show]);

  return (
    <Modal
      show={isVisible}
      title="Your account is missing some information"
      centerTitle
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center">
          <p className="h5 mb-2 text-white">
            We need you to reconnect your Github Account
          </p>
        </div>
        <div className="d-flex justify-content-center">
          <Button color="primary" onClick={handleReconnectAcount}>
            <span>Reconnect account</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}

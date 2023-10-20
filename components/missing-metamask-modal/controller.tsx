import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";
import { changeMissingMetamask } from "contexts/reducers/update-show-prop";

import MissingMetamaskModalView from "./view";

export default function MissingMetamaskModal() {
  const { asPath, push } = useRouter();

  const {
    state: {
      show: { missingMetamask },
    },
    dispatch,
  } = useAppState();

  function handleReload() {
    push(asPath);
  }

  function handleClose() {
    dispatch(changeMissingMetamask(false));
  }

  return (
    <MissingMetamaskModalView
      show={missingMetamask}
      handleReload={handleReload}
      handleClose={handleClose}
    />
  );
}

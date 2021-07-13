import { createContext, Dispatch, SetStateAction, useState } from "react";
import Loading from "../components/loading";

let getLoadingState: () => boolean;

let setLoadingAttributes: (show: boolean, message?: string) => void;

const LoadingContext = createContext(false);

function LoadingContextProvider({ children }) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>();
  setLoadingAttributes = (show: boolean, message?: string) => {
    setLoading(show);
    setMessage(message);
  };
  getLoadingState = () => isLoading;
  return (
    <LoadingContext.Provider value={isLoading}>
      <Loading show={isLoading}>{message}</Loading>
      {children}
    </LoadingContext.Provider>
  );
}

export {
  LoadingContextProvider,
  LoadingContext,
  setLoadingAttributes,
  getLoadingState,
};

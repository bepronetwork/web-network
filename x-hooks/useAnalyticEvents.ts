import {Analytic, EventName} from "../interfaces/analytics";
import {event} from "nextjs-google-analytics";
import {analyticEvents} from "../helpers/analytic-events";
import {useAppState} from "../contexts/app-state";

export default function useAnalyticEvents() {

  const {state} = useAppState();

  /**
   *
   * @param eventName name of the event to be sent (must exist in analyticsEvents const)
   * @param details details to be sent in that event
   */
  function pushAnalytic(eventName: EventName, details: {[options: string]: string} = {}) {

    function getCallback({type}: Analytic) {
      // console.debug(`Trying to push ${eventName} with type ${type}`, details)
      switch (type) {
        case "ga4":
          return event;
        default:
          return (a: string, b: any) => Promise.reject(`Missing implementation for ${type}`);
      }
    }

    if (state?.currentUser) {
      const {walletAddress, connected, handle, login} = state.currentUser;
      details = {
        ...details,
        walletAddress: walletAddress.toString(), connected: connected.toString(), handle, login
      };
    }


    if (state?.connectedChain)
      details = {
        ...details,
        ...state.connectedChain,
      }

    if (eventName in analyticEvents)
      return Promise.all(
          analyticEvents[eventName]
            .map(getCallback)
            .map(call => {
              // console.debug(`Pushing ${eventName}`)
              return call(eventName, details);
            })
        )
        .then(() => {
          // console.debug(`Event published ${eventName}`, details);
          return true;
        })
        .catch(e => {
          console.error(`Failed to push events`, e?.message || e?.toString() || "could not get error");
          return false;
        });

    return false;
  }

  return {
    pushAnalytic
  }
}
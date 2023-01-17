import {Analytic, EventName} from "../interfaces/analytics";
import {error, info} from "../services/logging";
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
      info(`Trying to push ${eventName} with type ${type}`, details)
      switch (type) {
        case "ga4":
          return event;
        default:
          return (a: string, b: any) => Promise.reject(`Missing implementation for ${type}`);
      }
    }

    if (state?.currentUser)
      details = {
        ...details,
        ...state.currentUser,
      } as any;

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
              info(`Pushing ${eventName}`)
              return call(eventName, details);
            })
        )
        .then(() => {
          info(`Event published ${eventName}`, details);
          return true;
        })
        .catch(e => {
          error(`Failed to push events`, e?.message || e?.toString() || "could not get error");
          return false;
        });

    return false;
  }

  return {
    pushAnalytic
  }
}
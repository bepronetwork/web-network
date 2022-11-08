import {useState} from "react";

import {useAppState} from "../contexts/app-state";
import {updateSettings} from "../contexts/reducers/change-settings";
import {updateShowProp} from "../contexts/reducers/update-show-prop";
import {WinStorage} from "../services/win-storage";
import useApi from "./use-api";

/**
 * Loads settings with useEffect if not loaded previously
 */
export function useSettings() {
  const {state, dispatch} = useAppState();
  const {getSettings} = useApi();

  const [storage,] =
    useState<WinStorage>(new WinStorage('web-network.settings', 3600 * 1000, 'sessionStorage'))

  /**
   * Load settings on useSettings() start only if `state.Settings` is empty
   * Reload settings on each session start
   */
  function loadSettings() {
    console.debug(`loading Settings`, state.Settings);
    if (state.Settings)
      return;

    console.debug(`loading storage Settings`, storage.value);

    if (storage.value) {
      console.debug(`dispatching storage`, storage.value);
      // dispatch(updateSettings(storage.value));
      return storage.value;
    }

    dispatch(updateShowProp({failedLoadSettings: false}));
    dispatch(updateSettings({} as any));
    return getSettings()
      .then(settings => {
        return {
          ...settings,
          beproToken: {
            address: settings?.contracts?.settlerToken,
            name: "Bepro Network",
            symbol: "BEPRO"
          }
        }
      })
      .then(settings => {
        console.log(`Got settings`, settings);
        storage.value = settings;
        // setTmpSettings(settings)
        //dispatch(updateSettings(settings));
        return settings;
      })
      .catch(e => {
        console.error(`Failed to load settings from db`, e);
        dispatch(updateShowProp({failedLoadSettings: true}));
      });
  }

  return {
    loadSettings
  }
}
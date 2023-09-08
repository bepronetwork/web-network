import {useState} from "react";

import {useAppState} from "../contexts/app-state";
import {updateSettings} from "../contexts/reducers/change-settings";
import {updateShowProp} from "../contexts/reducers/update-show-prop";
import {WinStorage} from "../services/win-storage";
import { useGetSettings } from "./api/use-get-settings";

/**
 * Loads settings with useEffect if not loaded previously
 */
export function useSettings() {
  const {state, dispatch} = useAppState();

  const [storage,] =
    useState<WinStorage>(new WinStorage('web-network.settings', 3600 * 1000, 'sessionStorage'))

  /**
   * Load settings on useSettings() start only if `state.Settings` is empty
   * Reload settings on each session start
   */
  function loadSettings(force?: boolean) {
    if (state.Settings && !force)
      return;

    if (storage.value && !force) {
      dispatch(updateSettings(storage.value));
      // return storage.value;
      return;
    }

    dispatch(updateShowProp({failedLoadSettings: false}));
    dispatch(updateSettings({} as any));
    useGetSettings()
      .then(settings => {
        storage.value = settings;
        // setTmpSettings(settings)
        dispatch(updateSettings(settings));
        // return settings;
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
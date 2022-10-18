import useApi from "./use-api";
import {useContext, useEffect, useState} from "react";
import {AppStateContext} from "../contexts/app-state";
import {WinStorage} from "../services/win-storage";
import {changeSettings} from "../contexts/reducers/change-settings";
import {updateShowProp} from "../contexts/reducers/update-show-prop";

/**
 * Loads settings with useEffect if not loaded previously
 */
export function useSettings() {
  const {state, dispatch} = useContext(AppStateContext);

  const {getSettings} = useApi();

  const [storage,] =
    useState<WinStorage>(new WinStorage('web-network.settings', 3600 * 1000, 'sessionStorage'))

  /**
   * Load settings on useSettings() start only if `state.Settings` is empty
   * Reload settings on each session start
   */
  function loadSettings() {
    if (state.Settings)
      return;

    if (storage.value) {
      dispatch(changeSettings.update(storage.value));
      return;
    }

    dispatch(updateShowProp({failedLoadSettings: false}));

    getSettings()
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
        storage.value = settings;
        dispatch(changeSettings.update(settings));
      })
      .catch(e => {
        console.error(`Failed to load settings from db`, e);
        dispatch(updateShowProp({failedLoadSettings: true}));
      });
  }

  useEffect(loadSettings, [state.Settings]);
}
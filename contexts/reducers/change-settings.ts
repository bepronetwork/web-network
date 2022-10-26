import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SettingsType} from "../../types/settings";
import {SimpleAction} from "./reducer";
import {State} from "../../interfaces/application-state";

class ChangeSettings extends SimpleAction<SettingsType> {
  constructor() {
    super(AppStateReduceId.Settings, 'Settings');
  }

  reducer(state: State, payload: SettingsType, subAction?: any): State {
    const transformed = {
      ...state.Settings || {},
      ...payload,
    }

    return super.reducer(state, transformed);
  }
}

export const changeSettings = new ChangeSettings();

export const updateSettings = (settings: SettingsType) =>
  changeSettings.update(settings)
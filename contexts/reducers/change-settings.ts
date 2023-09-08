import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";
import {SettingsType} from "../../types/settings";
import {SimpleAction} from "./reducer";

export const changeSettings = new SimpleAction<SettingsType>(AppStateReduceId.Settings, 'Settings');

export const updateSettings = (settings: SettingsType) =>
  changeSettings.update(JSON.parse(JSON.stringify(settings || {})))
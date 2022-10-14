import {SimpleAction} from "./reducer";
import {SettingsType} from "../../types/settings";
import {State} from "../../interfaces/application-state";
import {AppStateReduceId} from "../../interfaces/enums/app-state-reduce-id";

export const changeSettings =
  new SimpleAction<SettingsType>(AppStateReduceId.Settings, 'Settings');
import { SettingsType } from "contexts/settings";

interface Setting {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  visibility: "public" | "private";
  group?: string;
}

const parseSettingValue = (setting: Setting) => {
  const parsers = {
    "string": value => value,
    "json": value => JSON.parse(value),
    "number": value => +value,
    "boolean": value => value === "true"
  };

  return parsers[setting.type](setting.value);
};

const settingsToJson = (settings: Setting[]): SettingsType => {
  const settingsJson = {};

  settings.forEach(setting => {
    const parsedValue = parseSettingValue(setting);

    const key = setting.group || setting.key;
    let value = parsedValue;

    if (setting.group)
      value = { 
        ...settingsJson[key],
        [setting.key]: parsedValue 
      };

    settingsJson[key] = value;
  });

  return settingsJson;
};

const getSettingsFromSessionStorage = () => 
  typeof window !== 'undefined' && JSON.parse(sessionStorage.getItem("web-network.settings")) || undefined;

const setSettingsToSessionStorage = (settings: SettingsType) => {
  if (typeof window !== 'undefined')
    sessionStorage.setItem("web-network.settings", JSON.stringify(settings));
}

export type { Setting };
export { settingsToJson, parseSettingValue, setSettingsToSessionStorage, getSettingsFromSessionStorage };
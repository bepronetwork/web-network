import { SettingsType } from "contexts/settings";

interface Setting {
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
  visibility: "public" | "private";
  group?: string;
}

const getSettingsFromSessionStorage = () => 
  typeof window !== 'undefined' && JSON.parse(sessionStorage.getItem("web-network.settings")) || undefined;

const setSettingsToSessionStorage = (settings: SettingsType) => {
  if (typeof window !== 'undefined')
    sessionStorage.setItem("web-network.settings", JSON.stringify(settings));
}

export type { Setting };
export { setSettingsToSessionStorage, getSettingsFromSessionStorage };
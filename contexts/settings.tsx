import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import SettingsNotLoaded from "components/settings-not-loaded";

import { getSettingsFromSessionStorage, setSettingsToSessionStorage } from "helpers/settings";

import { SettingsType } from "types/settings";

import useApi from "x-hooks/use-api";

interface SettingsContextProps {
  settings?: SettingsType;
  failed?: boolean;
  fetchAndUpdateSettings?: () => Promise<SettingsType>;
}

const SettingsContext = createContext<SettingsContextProps>(undefined);

const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType>(undefined);
  const [failed, setFailed] = useState<boolean>(false);

  const { getSettings } = useApi();

  const fetchAndUpdateSettings = useCallback(async () => {
    try {
      const settings = await getSettings();
      const settingsWithBeproToken = {
        ...settings,
        beproToken: {
          address: settings?.contracts?.settlerToken,
          name: "Bepro Network",
          symbol: "BEPRO"
        }
      };

      setSettings(settingsWithBeproToken);
      setSettingsToSessionStorage(settingsWithBeproToken);

      setFailed(false);

      return settings;
    } catch (error) {
      console.debug("Failed to fetch settings", error);
      setFailed(true);
    }
  }, [failed]);

  useEffect(() => {
    const settingsOnSessionStorage = getSettingsFromSessionStorage();

    if (settingsOnSessionStorage)
      return setSettings(settingsOnSessionStorage);

    fetchAndUpdateSettings();
  }, []);

  const memoizedValue = useMemo<SettingsContextProps>(() => ({ 
    settings,
    fetchAndUpdateSettings
  }), [ settings, fetchAndUpdateSettings ]);

  return(
    <SettingsContext.Provider value={memoizedValue}>
      <SettingsNotLoaded isVisible={failed} />
      {children}
    </SettingsContext.Provider>
  );
};

const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within an SettingsProvider");
  }

  return context;
};

export {
  SettingsProvider,
  useSettings
};
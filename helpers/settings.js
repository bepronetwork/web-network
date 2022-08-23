class Settings {
  constructor(settings = undefined) {
    this.settings = settings || [];
  }

  parseValue(setting) {
    const parsers = {
      "string": value => value,
      "json": value => JSON.parse(value),
      "number": value => +value,
      "boolean": value => value === "true"
    };
  
    return parsers[setting.type](setting.value);
  }

  raw(settingsToMerge = undefined) {
    const rawValue = {};

    this.settings.forEach(setting => {
      const parsedValue = this.parseValue(setting);
  
      const key = setting.group || setting.key;
      let value = parsedValue;
  
      if (setting.group)
        value = { 
          ...rawValue[key],
          [setting.key]: parsedValue 
        };
  
      rawValue[key] = value;
    });

    if (settingsToMerge) return this.merge(rawValue, settingsToMerge);

    return rawValue;
  }

  merge(settingsA, settingsB) {
    const keysA = Object.keys(settingsA);
    const keysB = Object.keys(settingsB);
    const repeatedKeys = keysA.filter(key => keysB.includes(key));

    return {
      ...settingsA,
      ...settingsB,
      ...Object.fromEntries(repeatedKeys.map(key => [key, {...settingsA[key], ...settingsB[key] }]))
    };
  }
}

const getSettingsFromSessionStorage = () => 
  typeof window !== 'undefined' && JSON.parse(sessionStorage.getItem("web-network.settings")) || undefined;

const setSettingsToSessionStorage = settings => {
  if (typeof window !== 'undefined')
    sessionStorage.setItem("web-network.settings", JSON.stringify(settings));
}

module.exports = { 
  Settings,
  getSettingsFromSessionStorage,
  setSettingsToSessionStorage
};
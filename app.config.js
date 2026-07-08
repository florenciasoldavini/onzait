const appJson = require("./app.json");

function getConfiguredKey(name) {
  const value = process.env[name];

  if (!value || value.startsWith("REPLACE_WITH_")) {
    return undefined;
  }

  return value;
}

module.exports = ({ config }) => {
  const androidGoogleMapsApiKey = getConfiguredKey(
    "GOOGLE_MAPS_ANDROID_SDK_KEY"
  );
  const iosGoogleMapsApiKey = getConfiguredKey("GOOGLE_MAPS_IOS_SDK_KEY");

  const baseConfig = {
    ...config,
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        ...appJson.expo.android?.config,
        ...(androidGoogleMapsApiKey
          ? { googleMaps: { apiKey: androidGoogleMapsApiKey } }
          : {})
      }
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        ...appJson.expo.ios?.config,
        ...(iosGoogleMapsApiKey
          ? { googleMapsApiKey: iosGoogleMapsApiKey }
          : {})
      }
    }
  };

  return baseConfig;
};

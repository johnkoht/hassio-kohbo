export function getHassConfig() {
  // @ts-ignore: process.env is available in Create React App
  return {
    url: process.env.REACT_APP_HASS_URL || '',
    // @ts-ignore: process.env is available in Create React App
    token: process.env.REACT_APP_HASS_TOKEN || '',
  };
} 
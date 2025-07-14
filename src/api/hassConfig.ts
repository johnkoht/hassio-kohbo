export function getHassConfig() {
  // Try to get config from window object first (runtime config)
  const windowConfig = (window as any).HASS_CONFIG;
  if (windowConfig) {
    console.log('Using runtime config from window.HASS_CONFIG');
    return {
      url: windowConfig.url || '',
      token: windowConfig.token || '',
    };
  }

  // Fallback to environment variables (build-time config)
  console.log('Using build-time environment variables');
  // @ts-ignore: process.env is available in Create React App
  const config = {
    url: process.env.REACT_APP_HASS_URL || '',
    // @ts-ignore: process.env is available in Create React App
    token: process.env.REACT_APP_HASS_TOKEN || '',
  };
  console.log('Build-time config:', { url: config.url, token: config.token ? '***' : 'missing' });
  return config;
} 
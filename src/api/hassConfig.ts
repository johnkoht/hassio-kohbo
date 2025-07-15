export function getHassConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, we need the actual URL for WebSocket connections
    // but we'll use relative URLs for HTTP API calls
    console.log('Using development mode with proxy');
    const devUrl = process.env.REACT_APP_HASS_URL || '';
    return {
      url: devUrl,
      token: process.env.REACT_APP_HASS_TOKEN || '',
    };
  }

  // Try to get config from window object first (runtime config for production)
  const windowConfig = (window as any).HASS_CONFIG;
  if (windowConfig && windowConfig.url !== 'HASS_URL_PLACEHOLDER') {
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
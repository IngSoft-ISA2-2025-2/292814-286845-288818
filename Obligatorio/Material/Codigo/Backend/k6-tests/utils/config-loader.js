export function loadConfig(env = 'dev') {
  const configPath = `./config/${env}.json`;
  
  try {
    const config = JSON.parse(open(configPath));
    return config;
  } catch (error) {
    console.error(`Failed to load config from ${configPath}: ${error}`);
    throw error;
  }
}

export function getBaseUrl(config) {
  return __ENV.BASE_URL || config.baseUrl;
}

export function getThresholds(config) {
  return config.thresholds || {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01']
  };
}

export function getScenario(config, scenarioName) {
  if (!config.scenarios || !config.scenarios[scenarioName]) {
    throw new Error(`Scenario '${scenarioName}' not found in configuration`);
  }
  return config.scenarios[scenarioName];
}

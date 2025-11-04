// Utility functions for loading configuration files

/**
 * Load configuration based on environment
 * @param {string} env - Environment name (dev, staging, prod)
 * @returns {object} Configuration object
 */
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

/**
 * Get base URL from environment variable or config
 * @param {object} config - Configuration object
 * @returns {string} Base URL
 */
export function getBaseUrl(config) {
  return __ENV.BASE_URL || config.baseUrl;
}

/**
 * Get threshold configuration
 * @param {object} config - Configuration object
 * @returns {object} Thresholds object
 */
export function getThresholds(config) {
  return config.thresholds || {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01']
  };
}

/**
 * Get scenario configuration
 * @param {object} config - Configuration object
 * @param {string} scenarioName - Name of the scenario
 * @returns {object} Scenario configuration
 */
export function getScenario(config, scenarioName) {
  if (!config.scenarios || !config.scenarios[scenarioName]) {
    throw new Error(`Scenario '${scenarioName}' not found in configuration`);
  }
  return config.scenarios[scenarioName];
}

import { sleep } from 'k6';
import { loginAsOwner } from '../scenarios/login-scenario.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  vus: 1,
  duration: '30s',
  
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'login_success_rate': ['rate>0.99'],
    'login_duration_ms': ['p(95)<500'],
  },
  
  tags: {
    test_type: 'smoke',
    endpoint: 'login',
  },
};

export function setup() {
  console.log('Starting Smoke Test');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`VUs: ${options.vus}, Duration: ${options.duration}`);
  
  return { 
    baseUrl: BASE_URL,
    startTime: new Date().toISOString()
  };
}

export default function(data) {
  const loginResult = loginAsOwner(data.baseUrl);
  
  if (!loginResult.success) {
    console.error(`Login failed with status ${loginResult.status}`);
  }
  
  sleep(1);
}

export function teardown(data) {
  console.log('Smoke Test completed');
  console.log(`Started: ${data.startTime}, Finished: ${new Date().toISOString()}`);
}

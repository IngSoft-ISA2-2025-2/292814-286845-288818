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

export function handleSummary(data) {
  const duration = data.metrics.http_req_duration?.values;
  const iterations = data.metrics.iterations?.values.count || 0;
  const httpReqs = data.metrics.http_reqs?.values.count || 0;
  const failRate = (data.metrics.http_req_failed?.values.rate * 100 || 0).toFixed(2);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Smoke Test Report - PharmaGo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #2196F3; padding-bottom: 10px; }
    .metric { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #2196F3; }
    .metric-value { font-size: 24px; color: #2196F3; margin: 5px 0; }
    .status-pass { color: #4CAF50; font-weight: bold; }
    .status-fail { color: #f44336; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #2196F3; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Smoke Test Report - PharmaGo API</h1>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <div class="metric">
      <div>Total Requests: <span class="metric-value">${httpReqs}</span></div>
      <div>Failed Requests: <span class="${failRate > 1 ? 'status-fail' : 'status-pass'}">${failRate}%</span></div>
      <div>p95: <span class="${duration?.['p(95)'] < 500 ? 'status-pass' : 'status-fail'}">${duration?.['p(95)'].toFixed(2) || 'N/A'} ms</span></div>
    </div>
    <p>${failRate < 1 && duration?.['p(95)'] < 500 ? '<span class="status-pass">✓ PASSED</span>' : '<span class="status-fail">✗ FAILED</span>'}</p>
  </div>
</body>
</html>
  `;
  
  return {
    'stdout': `\n✓ Smoke Test Results:\n  Requests: ${httpReqs}\n  Failed: ${failRate}%\n  p95: ${duration?.['p(95)'].toFixed(2)}ms\n`,
    'results/smoke-test-summary.json': JSON.stringify(data),
    'results/smoke-test-summary.html': html
  };
}


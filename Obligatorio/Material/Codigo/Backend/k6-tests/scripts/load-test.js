import http from 'k6/http';
import { sleep } from 'k6';
import { login } from '../scenarios/login-scenario.js';
import { createReservation } from '../scenarios/reservation-scenario.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '3m', target: 20 },
    { duration: '30s', target: 30 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'reservation_creation_duration_ms': ['p(95)<600'],
    'reservation_success_rate': ['rate>0.95']
  }
};

export default function() {
  const authToken = login(BASE_URL, 'owner1', 'Aqwertyu2.');

  if (!authToken) {
    sleep(1);
    return;
  }

  const pharmacyName = 'Farmacia 1234';
  const drugs = [
    { drugName: 'Novemina', drugQuantity: 2 },
    { drugName: 'Aspirina', drugQuantity: 1 }
  ];

  const publicKey = createReservation(BASE_URL, authToken, pharmacyName, drugs);

  if (publicKey) {
    sleep(1);
  } else {
    sleep(2);
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/load-test-summary.json': JSON.stringify(data),
    'results/load-test-summary.html': htmlReport(data)
  };
}

function htmlReport(data) {
  const duration = data.metrics.http_req_duration?.values;
  const iterations = data.metrics.iterations?.values.count || 0;
  const httpReqs = data.metrics.http_reqs?.values.count || 0;
  const failRate = (data.metrics.http_req_failed?.values.rate * 100 || 0).toFixed(2);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Load Test Report - PharmaGo</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .metric { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #4CAF50; }
    .metric-name { font-weight: bold; color: #333; }
    .metric-value { font-size: 24px; color: #4CAF50; margin: 5px 0; }
    .status-pass { color: #4CAF50; font-weight: bold; }
    .status-fail { color: #f44336; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Load Test Report - PharmaGo API</h1>
    <p><strong>Test Type:</strong> Load Test</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    
    <h2>📊 Summary</h2>
    <div class="metric">
      <div class="metric-name">Total Iterations</div>
      <div class="metric-value">${iterations}</div>
    </div>
    <div class="metric">
      <div class="metric-name">Total HTTP Requests</div>
      <div class="metric-value">${httpReqs}</div>
    </div>
    <div class="metric">
      <div class="metric-name">Failed Requests</div>
      <div class="metric-value ${failRate > 1 ? 'status-fail' : 'status-pass'}">${failRate}%</div>
    </div>
    
    <h2>⏱️ Response Time Metrics</h2>
    <table>
      <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
      <tr>
        <td>Average</td>
        <td>${duration?.avg.toFixed(2) || 'N/A'} ms</td>
        <td>-</td>
        <td>-</td>
      </tr>
      <tr>
        <td>p95</td>
        <td>${duration?.['p(95)'].toFixed(2) || 'N/A'} ms</td>
        <td>&lt; 500 ms</td>
        <td class="${duration?.['p(95)'] < 500 ? 'status-pass' : 'status-fail'}">${duration?.['p(95)'] < 500 ? '✓ PASS' : '✗ FAIL'}</td>
      </tr>
      <tr>
        <td>p99</td>
        <td>${duration?.['p(99)'].toFixed(2) || 'N/A'} ms</td>
        <td>&lt; 1000 ms</td>
        <td class="${duration?.['p(99)'] < 1000 ? 'status-pass' : 'status-fail'}">${duration?.['p(99)'] < 1000 ? '✓ PASS' : '✗ FAIL'}</td>
      </tr>
      <tr>
        <td>Max</td>
        <td>${duration?.max.toFixed(2) || 'N/A'} ms</td>
        <td>-</td>
        <td>-</td>
      </tr>
    </table>
    
    <h2>📝 Conclusion</h2>
    <p>${duration?.['p(95)'] < 500 && duration?.['p(99)'] < 1000 && failRate < 1 
      ? '<span class="status-pass">✓ Test PASSED - System meets performance requirements</span>' 
      : '<span class="status-fail">✗ Test FAILED - System does not meet performance requirements</span>'}</p>
  </div>
</body>
</html>
  `;
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}Execution Summary\n`;
  summary += `${indent}================\n\n`;
  
  if (data.metrics.iterations) {
    summary += `${indent}Iterations: ${data.metrics.iterations.values.count}\n`;
  }
  
  if (data.metrics.http_reqs) {
    summary += `${indent}HTTP Requests: ${data.metrics.http_reqs.values.count}\n`;
  }
  
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `${indent}Response Time:\n`;
    summary += `${indent}  avg: ${duration.avg.toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${duration['p(95)'].toFixed(2)}ms\n`;
    summary += `${indent}  p99: ${duration['p(99)'].toFixed(2)}ms\n`;
  }
  
  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Failed Requests: ${failRate}%\n`;
  }
  
  return summary;
}

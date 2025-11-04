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
  const authToken = login(BASE_URL, 'owner@owner.com', 'owner123');

  if (!authToken) {
    sleep(1);
    return;
  }

  const pharmacyId = 1;
  const drugs = [
    { drugCode: 'ABC123', quantity: 2 },
    { drugCode: 'XYZ789', quantity: 1 }
  ];

  const publicKey = createReservation(BASE_URL, authToken, pharmacyId, drugs);

  if (publicKey) {
    sleep(1);
  } else {
    sleep(2);
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/load-test-summary.json': JSON.stringify(data)
  };
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

import http from 'k6/http';
import { sleep } from 'k6';
import { login } from '../scenarios/login-scenario.js';
import { createReservation, validateReservation } from '../scenarios/reservation-scenario.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '2m', target: 40 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<400', 'p(99)<800'],
    'http_req_failed': ['rate<0.01'],
    'reservation_validation_duration_ms': ['p(95)<300']
  }
};

const setupData = {};

export function setup() {
  const authToken = login(BASE_URL, 'owner1', 'Aqwertyu2.');
  
  if (!authToken) {
    throw new Error('Failed to authenticate in setup phase');
  }

  const publicKeys = [];
  for (let i = 0; i < 10; i++) {
    const drugs = [
      { drugName: 'Novemina', drugQuantity: 1 },
      { drugName: 'Perifar Flex', drugQuantity: 2 }
    ];
    
    const publicKey = createReservation(BASE_URL, authToken, 'Farmacia 1234', drugs);
    if (publicKey) {
      publicKeys.push(publicKey);
    }
    sleep(0.5);
  }

  return { publicKeys: publicKeys };
}

export default function(data) {
  if (!data.publicKeys || data.publicKeys.length === 0) {
    sleep(1);
    return;
  }

  const randomIndex = Math.floor(Math.random() * data.publicKeys.length);
  const publicKey = data.publicKeys[randomIndex];

  validateReservation(BASE_URL, publicKey);

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'results/validation-test-summary.json': JSON.stringify(data)
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  
  let summary = '\n';
  summary += `${indent}Validation Test Summary\n`;
  summary += `${indent}=======================\n\n`;
  
  if (data.metrics.iterations) {
    summary += `${indent}Total Iterations: ${data.metrics.iterations.values.count}\n`;
  }
  
  if (data.metrics.http_reqs) {
    summary += `${indent}Total HTTP Requests: ${data.metrics.http_reqs.values.count}\n`;
  }
  
  if (data.metrics.reservation_validation_duration_ms) {
    const duration = data.metrics.reservation_validation_duration_ms.values;
    summary += `${indent}Validation Duration:\n`;
    summary += `${indent}  avg: ${duration.avg.toFixed(2)}ms\n`;
    summary += `${indent}  p95: ${duration['p(95)'].toFixed(2)}ms\n`;
  }
  
  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    summary += `${indent}Failed Requests: ${failRate}%\n`;
  }
  
  summary += `${indent}\nThresholds Status:\n`;
  for (const [key, value] of Object.entries(data.metrics)) {
    if (value.thresholds) {
      for (const [threshold, result] of Object.entries(value.thresholds)) {
        const status = result.ok ? 'PASS' : 'FAIL';
        summary += `${indent}  [${status}] ${key}: ${threshold}\n`;
      }
    }
  }
  
  return summary;
}

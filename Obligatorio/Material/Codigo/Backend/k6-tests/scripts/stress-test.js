import http from 'k6/http';
import { sleep } from 'k6';
import { login } from '../scenarios/login-scenario.js';
import { createReservation } from '../scenarios/reservation-scenario.js';
import { createPurchase } from '../scenarios/purchase-scenario.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export const options = {
  stages: [
    { duration: '2m', target: 10 },
    { duration: '3m', target: 30 },
    { duration: '3m', target: 50 },
    { duration: '3m', target: 70 },
    { duration: '3m', target: 100 },
    { duration: '2m', target: 0 }
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.05'],
    'purchase_creation_duration_ms': ['p(95)<800'],
    'purchase_success_rate': ['rate>0.90']
  }
};

export default function() {
  const authToken = login(BASE_URL, 'owner1', 'Aqwertyu2.');

  if (!authToken) {
    sleep(2);
    return;
  }

  const pharmacies = ['Farmacia 1234', 'Farmacia Av. Italia', 'El Tunel'];
  const drugOptions = [
    { drugName: 'Novemina', drugQuantity: Math.floor(Math.random() * 3) + 1 },
    { drugName: 'Perifar Flex', drugQuantity: Math.floor(Math.random() * 2) + 1 },
    { drugName: 'Aspirina', drugQuantity: Math.floor(Math.random() * 2) + 1 }
  ];
  
  const pharmacyName = pharmacies[Math.floor(Math.random() * pharmacies.length)];
  const drugs = [
    drugOptions[Math.floor(Math.random() * drugOptions.length)],
    drugOptions[Math.floor(Math.random() * drugOptions.length)]
  ];

  const publicKey = createReservation(BASE_URL, authToken, pharmacyName, drugs);

  if (!publicKey) {
    sleep(2);
    return;
  }

  sleep(Math.random() * 2 + 1);

  const buyerEmail = `buyer${Date.now()}${Math.floor(Math.random() * 1000)}@test.com`;
  const purchaseSuccess = createPurchase(BASE_URL, authToken, publicKey, buyerEmail);

  if (purchaseSuccess) {
    sleep(1);
  } else {
    sleep(3);
  }
}

export function handleSummary(data) {
  const summary = generateSummary(data);
  
  return {
    'stdout': summary,
    'results/stress-test-summary.json': JSON.stringify(data),
    'results/stress-test-report.txt': summary
  };
}

function generateSummary(data) {
  let summary = '\n';
  summary += '==========================================\n';
  summary += '         STRESS TEST RESULTS              \n';
  summary += '==========================================\n\n';
  
  summary += 'TEST CONFIGURATION\n';
  summary += '------------------\n';
  summary += 'Max VUs: 100\n';
  summary += 'Duration: 16 minutes\n';
  summary += 'Ramp Pattern: 10 -> 30 -> 50 -> 70 -> 100\n\n';
  
  summary += 'EXECUTION METRICS\n';
  summary += '-----------------\n';
  
  if (data.metrics.iterations) {
    summary += `Total Iterations: ${data.metrics.iterations.values.count}\n`;
  }
  
  if (data.metrics.http_reqs) {
    summary += `Total HTTP Requests: ${data.metrics.http_reqs.values.count}\n`;
  }
  
  if (data.metrics.vus_max) {
    summary += `Max VUs Reached: ${data.metrics.vus_max.values.max}\n`;
  }
  
  summary += '\nRESPONSE TIME ANALYSIS\n';
  summary += '----------------------\n';
  
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration.values;
    summary += `Average: ${duration.avg.toFixed(2)}ms\n`;
    summary += `Median (p50): ${duration.med.toFixed(2)}ms\n`;
    summary += `p90: ${duration['p(90)'].toFixed(2)}ms\n`;
    summary += `p95: ${duration['p(95)'].toFixed(2)}ms\n`;
    summary += `p99: ${duration['p(99)'].toFixed(2)}ms\n`;
    summary += `Max: ${duration.max.toFixed(2)}ms\n`;
  }
  
  summary += '\nERROR ANALYSIS\n';
  summary += '--------------\n';
  
  if (data.metrics.http_req_failed) {
    const failRate = (data.metrics.http_req_failed.values.rate * 100).toFixed(2);
    const failCount = data.metrics.http_req_failed.values.fails || 0;
    summary += `Failed Requests: ${failCount} (${failRate}%)\n`;
  }
  
  if (data.metrics.http_error_rate_4xx) {
    const rate4xx = (data.metrics.http_error_rate_4xx.values.rate * 100).toFixed(2);
    summary += `4xx Errors: ${rate4xx}%\n`;
  }
  
  if (data.metrics.http_error_rate_5xx) {
    const rate5xx = (data.metrics.http_error_rate_5xx.values.rate * 100).toFixed(2);
    summary += `5xx Errors: ${rate5xx}%\n`;
  }
  
  summary += '\nBUSINESS METRICS\n';
  summary += '----------------\n';
  
  if (data.metrics.reservations_created_total) {
    summary += `Reservations Created: ${data.metrics.reservations_created_total.values.count}\n`;
  }
  
  if (data.metrics.purchases_completed_total) {
    summary += `Purchases Completed: ${data.metrics.purchases_completed_total.values.count}\n`;
  }
  
  if (data.metrics.purchase_creation_duration_ms) {
    const purchaseDuration = data.metrics.purchase_creation_duration_ms.values;
    summary += `Purchase Duration (p95): ${purchaseDuration['p(95)'].toFixed(2)}ms\n`;
  }
  
  summary += '\nTHRESHOLDS STATUS\n';
  summary += '-----------------\n';
  
  let allPassed = true;
  for (const [key, value] of Object.entries(data.metrics)) {
    if (value.thresholds) {
      for (const [threshold, result] of Object.entries(value.thresholds)) {
        const status = result.ok ? 'PASS' : 'FAIL';
        if (!result.ok) allPassed = false;
        summary += `[${status}] ${key}: ${threshold}\n`;
      }
    }
  }
  
  summary += '\n==========================================\n';
  summary += `OVERALL RESULT: ${allPassed ? 'PASSED' : 'FAILED'}\n`;
  summary += '==========================================\n';
  
  return summary;
}

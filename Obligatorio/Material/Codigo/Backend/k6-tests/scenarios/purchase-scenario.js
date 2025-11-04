import http from 'k6/http';
import { check } from 'k6';
import { recordPurchaseCreationMetrics } from '../utils/custom-metrics.js';

export function createPurchase(baseUrl, authToken, reservationPublicKey, buyerEmail) {
  const payload = JSON.stringify({
    reservationPublicKey: reservationPublicKey,
    buyerEmail: buyerEmail
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    }
  };

  const startTime = Date.now();
  const response = http.post(`${baseUrl}/api/Purchases`, payload, params);
  const duration = Date.now() - startTime;

  const success = check(response, {
    'purchase created successfully': (r) => r.status === 200 || r.status === 201,
    'response has purchase id': (r) => {
      if (r.status !== 200 && r.status !== 201) return false;
      const body = JSON.parse(r.body);
      return body.id !== undefined || body.purchaseId !== undefined;
    }
  });

  recordPurchaseCreationMetrics(response, duration);

  return success;
}

export function getPurchasesByDate(baseUrl, authToken, startDate, endDate) {
  const params = {
    headers: {
      'Authorization': authToken
    }
  };

  let url = `${baseUrl}/api/Purchases/ByDate`;
  const queryParams = [];
  
  if (startDate) {
    queryParams.push(`start=${startDate}`);
  }
  if (endDate) {
    queryParams.push(`end=${endDate}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }

  const response = http.get(url, params);

  check(response, {
    'purchases retrieved successfully': (r) => r.status === 200,
    'response is array': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return Array.isArray(body);
    }
  });

  return response;
}

export function getAllPurchases(baseUrl, authToken) {
  const params = {
    headers: {
      'Authorization': authToken
    }
  };

  const response = http.get(`${baseUrl}/api/Purchases`, params);

  check(response, {
    'all purchases retrieved successfully': (r) => r.status === 200
  });

  return response;
}

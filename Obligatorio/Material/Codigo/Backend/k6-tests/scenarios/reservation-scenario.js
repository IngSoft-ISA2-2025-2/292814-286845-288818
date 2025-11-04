import http from 'k6/http';
import { check } from 'k6';
import { 
  recordReservationCreationMetrics,
  recordReservationValidationMetrics
} from '../utils/custom-metrics.js';

export function createReservation(baseUrl, authToken, pharmacyId, drugs) {
  const payload = JSON.stringify({
    pharmacyId: pharmacyId,
    drugs: drugs,
    email: `customer${Date.now()}@test.com`,
    customerName: `Customer ${Date.now()}`
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken
    }
  };

  const startTime = Date.now();
  const response = http.post(`${baseUrl}/api/Reservation`, payload, params);
  const duration = Date.now() - startTime;

  const success = check(response, {
    'reservation created successfully': (r) => r.status === 200 || r.status === 201,
    'response has publicKey': (r) => {
      if (r.status !== 200 && r.status !== 201) return false;
      const body = JSON.parse(r.body);
      return body.publicKey !== undefined && body.publicKey !== null;
    }
  });

  recordReservationCreationMetrics(response, duration);

  if (success && (response.status === 200 || response.status === 201)) {
    const body = JSON.parse(response.body);
    return body.publicKey;
  }

  return null;
}

export function getReservationsByUser(baseUrl, email, secret) {
  const url = `${baseUrl}/api/Reservation?Email=${email}&Secret=${secret}`;
  const response = http.get(url);

  check(response, {
    'reservations retrieved successfully': (r) => r.status === 200,
    'response is array': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return Array.isArray(body);
    }
  });

  return response;
}

export function validateReservation(baseUrl, publicKey) {
  const startTime = Date.now();
  const response = http.get(`${baseUrl}/api/Reservation/validate/${publicKey}`);
  const duration = Date.now() - startTime;

  check(response, {
    'reservation validated successfully': (r) => r.status === 200,
    'response has reservation data': (r) => {
      if (r.status !== 200) return false;
      const body = JSON.parse(r.body);
      return body.pharmacyName !== undefined;
    }
  });

  recordReservationValidationMetrics(response, duration);

  return response;
}

import http from 'k6/http';
import { check, sleep } from 'k6';
import { recordLoginMetrics } from '../utils/custom-metrics.js';

export function loginScenario(baseUrl, credentials) {
  const url = `${baseUrl}/api/Login`;
  
  const payload = JSON.stringify({
    userName: credentials.userName,
    password: credentials.password
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const startTime = Date.now();
  const response = http.post(url, payload, params);
  const duration = Date.now() - startTime;

  const checkResult = check(response, {
    'login status is 200': (r) => r.status === 200,
    'response has token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined && body.token !== null && body.token !== '';
      } catch (e) {
        return false;
      }
    },
    'response has role': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.role !== undefined && body.role !== null;
      } catch (e) {
        return false;
      }
    },
    'response has userName': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.userName !== undefined && body.userName !== null;
      } catch (e) {
        return false;
      }
    },
    'response time < 500ms': (r) => duration < 500,
  });

  recordLoginMetrics(response, duration);

  let responseData = null;
  if (response.status === 200) {
    try {
      responseData = JSON.parse(response.body);
    } catch (e) {
      console.error(`Failed to parse login response: ${e}`);
    }
  }

  sleep(1);

  return {
    success: response.status === 200,
    status: response.status,
    token: responseData?.token,
    role: responseData?.role,
    userName: responseData?.userName,
    duration: duration,
    checksPass: checkResult
  };
}

export function loginAsOwner(baseUrl) {
  return loginScenario(baseUrl, {
    userName: 'owner1',
    password: 'Aqwertyu2.'
  });
}

export function loginAsEmployee(baseUrl) {
  return loginScenario(baseUrl, {
    userName: 'employee1',
    password: 'Aqwertyu2.'
  });
}

export function loginWithInvalidCredentials(baseUrl) {
  return loginScenario(baseUrl, {
    userName: 'invalid@invalid.com',
    password: 'wrongpassword'
  });
}

export function login(baseUrl, userName, password) {
  const result = loginScenario(baseUrl, { userName, password });
  return result.success ? result.token : null;
}

import { Counter, Trend, Rate, Gauge } from 'k6/metrics';

export const reservationsCreated = new Counter('reservations_created_total');
export const reservationsCancelled = new Counter('reservations_cancelled_total');
export const purchasesCompleted = new Counter('purchases_completed_total');
export const loginAttempts = new Counter('login_attempts_total');
export const loginSuccess = new Counter('login_success_total');
export const loginFailures = new Counter('login_failures_total');

export const loginDuration = new Trend('login_duration_ms');
export const reservationCreationDuration = new Trend('reservation_creation_duration_ms');
export const reservationValidationDuration = new Trend('reservation_validation_duration_ms');
export const purchaseCreationDuration = new Trend('purchase_creation_duration_ms');

export const errorRate4xx = new Rate('http_error_rate_4xx');
export const errorRate5xx = new Rate('http_error_rate_5xx');

export const loginSuccessRate = new Rate('login_success_rate');
export const reservationSuccessRate = new Rate('reservation_success_rate');
export const purchaseSuccessRate = new Rate('purchase_success_rate');

export function recordLoginMetrics(response, duration) {
  loginAttempts.add(1);
  loginDuration.add(duration);
  
  if (response.status === 200) {
    loginSuccess.add(1);
    loginSuccessRate.add(true);
  } else {
    loginFailures.add(1);
    loginSuccessRate.add(false);
  }
  
  recordErrorMetrics(response);
}

export function recordReservationCreationMetrics(response, duration) {
  reservationCreationDuration.add(duration);
  
  if (response.status === 200 || response.status === 201) {
    reservationsCreated.add(1);
    reservationSuccessRate.add(true);
  } else {
    reservationSuccessRate.add(false);
  }
  
  recordErrorMetrics(response);
}

export function recordReservationValidationMetrics(response, duration) {
  reservationValidationDuration.add(duration);
  recordErrorMetrics(response);
}

export function recordPurchaseCreationMetrics(response, duration) {
  purchaseCreationDuration.add(duration);
  
  if (response.status === 200 || response.status === 201) {
    purchasesCompleted.add(1);
    purchaseSuccessRate.add(true);
  } else {
    purchaseSuccessRate.add(false);
  }
  
  recordErrorMetrics(response);
}

export function recordErrorMetrics(response) {
  if (response.status >= 400 && response.status < 500) {
    errorRate4xx.add(true);
  } else if (response.status >= 500) {
    errorRate5xx.add(true);
  } else {
    errorRate4xx.add(false);
    errorRate5xx.add(false);
  }
}

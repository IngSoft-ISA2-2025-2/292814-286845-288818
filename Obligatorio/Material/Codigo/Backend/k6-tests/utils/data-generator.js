// Utility functions for generating test data

/**
 * Generate random email
 * @returns {string} Random email address
 */
export function generateEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `testuser${timestamp}${random}@pharmago.test`;
}

/**
 * Generate random password
 * @param {number} length - Password length
 * @returns {string} Random password
 */
export function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Generate random username
 * @returns {string} Random username
 */
export function generateUsername() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user${timestamp}${random}`;
}

/**
 * Generate random drug code
 * @returns {string} Random drug code
 */
export function generateDrugCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  code += Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return code;
}

/**
 * Generate random quantity
 * @param {number} min - Minimum quantity
 * @param {number} max - Maximum quantity
 * @returns {number} Random quantity
 */
export function generateQuantity(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random item from array
 * @param {Array} array - Source array
 * @returns {*} Random item
 */
export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sleep for a random duration
 * @param {number} min - Minimum duration in seconds
 * @param {number} max - Maximum duration in seconds
 * @returns {number} Actual sleep duration
 */
export function randomSleep(min = 1, max = 3) {
  const duration = Math.random() * (max - min) + min;
  return duration;
}

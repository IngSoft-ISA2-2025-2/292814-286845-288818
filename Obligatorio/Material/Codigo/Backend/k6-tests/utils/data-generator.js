export function generateEmail() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `testuser${timestamp}${random}@pharmago.test`;
}

export function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function generateUsername() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user${timestamp}${random}`;
}

export function generateDrugCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  code += Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return code;
}

export function generateQuantity(min = 1, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomSleep(min = 1, max = 3) {
  const duration = Math.random() * (max - min) + min;
  return duration;
}

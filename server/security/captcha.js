const crypto = require('crypto');

const challenges = new Map();
const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function cleanupExpired() {
  const now = Date.now();
  for (const [id, challenge] of challenges.entries()) {
    if (challenge.expiresAt <= now) {
      challenges.delete(id);
    }
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCaptcha(ip = '') {
  cleanupExpired();
  const a = randomInt(2, 15);
  const b = randomInt(2, 15);
  const operators = ['+', '-', '*'];
  const operator = operators[randomInt(0, operators.length - 1)];
  let answer = 0;
  if (operator === '+') answer = a + b;
  if (operator === '-') answer = a - b;
  if (operator === '*') answer = a * b;
  const id = crypto.randomUUID();
  challenges.set(id, {
    answer: String(answer),
    ip,
    attempts: 0,
    expiresAt: Date.now() + CAPTCHA_TTL_MS,
  });
  return {
    captchaId: id,
    challenge: `${a} ${operator} ${b}`,
    expiresInMs: CAPTCHA_TTL_MS,
  };
}

function verifyCaptcha(captchaId, captchaAnswer, ip = '') {
  cleanupExpired();
  if (!captchaId || captchaAnswer === undefined || captchaAnswer === null) {
    return { ok: false, message: 'Captcha obrigatório' };
  }
  const challenge = challenges.get(captchaId);
  if (!challenge) {
    return { ok: false, message: 'Captcha inválido ou expirado' };
  }
  if (challenge.ip && ip && challenge.ip !== ip) {
    return { ok: false, message: 'Captcha inválido para este dispositivo' };
  }
  challenge.attempts += 1;
  if (challenge.attempts > MAX_ATTEMPTS) {
    challenges.delete(captchaId);
    return { ok: false, message: 'Captcha bloqueado por tentativas inválidas' };
  }
  if (String(captchaAnswer).trim() !== challenge.answer) {
    return { ok: false, message: 'Resposta de captcha inválida' };
  }
  challenges.delete(captchaId);
  return { ok: true };
}

module.exports = {
  createCaptcha,
  verifyCaptcha,
};

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { createCaptcha } = require('../security/captcha');

const captchaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Muitas solicitações de captcha. Aguarde 1 minuto.' },
});

router.get('/captcha', captchaLimiter, (req, res) => {
  const data = createCaptcha(req.ip);
  res.json(data);
});

module.exports = router;

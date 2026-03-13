const express = require('express');
const router = express.Router();
const { createPaymentPreference, getPaymentStatus, getPayment, createPixPayment, createCartPreference } = require('../integrations/mercadopago');
const { createCheckoutSession, createCartCheckoutSession } = require('../integrations/stripe');
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../database');

function getSettingsMap(db) {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

function getPaymentConfig(settings) {
  return {
    enabled: settings.payments_enabled === '1',
    cartEnabled: settings.payments_allow_cart === '1',
    provider: settings.payment_provider || 'mercadopago',
    mercadopagoAccessToken: settings.mercadopago_access_token || process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    stripeSecretKey: settings.stripe_secret_key || process.env.STRIPE_SECRET_KEY || '',
    stripePublicKey: settings.stripe_public_key || process.env.VITE_STRIPE_PUBLIC_KEY || '',
  };
}

router.get('/config', (req, res) => {
  try {
    const db = getDb();
    const settings = getSettingsMap(db);
    const config = getPaymentConfig(settings);
    res.json({
      enabled: config.enabled,
      cartEnabled: config.cartEnabled,
      provider: config.provider,
      stripePublicKey: config.stripePublicKey,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { appointmentId, servicePrice, paymentMethod = 'credit_card' } = req.body;
    const db = getDb();
    const settings = getSettingsMap(db);
    const config = getPaymentConfig(settings);
    if (!config.enabled) {
      return res.status(400).json({ message: 'Pagamentos estão desativados no painel administrativo' });
    }

    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND client_id = ?')
      .get(appointmentId, req.user.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (config.provider === 'stripe') {
      const session = await createCheckoutSession(appointmentId, servicePrice, req.user.email, {
        secretKey: config.stripeSecretKey,
      });
      return res.json({
        ...session,
        paymentMethod: 'credit_card',
        provider: 'stripe',
        appointmentId,
      });
    }

    if (paymentMethod === 'pix') {
      const pixPayment = await createPixPayment(appointmentId, servicePrice, req.user.email, {
        accessToken: config.mercadopagoAccessToken,
      });
      return res.json({
        ...pixPayment,
        paymentMethod: 'pix',
        provider: 'mercadopago',
        appointmentId,
      });
    } else {
      const preference = await createPaymentPreference(appointmentId, servicePrice, req.user.email, {
        accessToken: config.mercadopagoAccessToken,
      });
      return res.json({
        ...preference,
        paymentMethod: 'credit_card',
        provider: 'mercadopago',
        appointmentId,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/cart-checkout', authenticate, async (req, res) => {
  try {
    const { items = [] } = req.body;
    const safeItems = items.filter(item => item && item.name && Number(item.quantity) > 0 && Number(item.price) > 0);
    if (safeItems.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }
    const db = getDb();
    const settings = getSettingsMap(db);
    const config = getPaymentConfig(settings);
    if (!config.enabled || !config.cartEnabled) {
      return res.status(400).json({ message: 'Checkout de carrinho desativado no painel administrativo' });
    }
    if (config.provider === 'stripe') {
      const session = await createCartCheckoutSession(safeItems, req.user.email, {
        secretKey: config.stripeSecretKey,
      });
      return res.json({ ...session, provider: 'stripe' });
    }
    const preference = await createCartPreference(safeItems, req.user.email, {
      accessToken: config.mercadopagoAccessToken,
    });
    return res.json({ ...preference, provider: 'mercadopago' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/status/:paymentId', authenticate, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const db = getDb();
    const settings = getSettingsMap(db);
    const config = getPaymentConfig(settings);
    const status = await getPaymentStatus(paymentId, {
      accessToken: config.mercadopagoAccessToken,
    });
    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    const { action, data: webhookData } = data;
    const db = getDb();
    const settings = getSettingsMap(db);
    const config = getPaymentConfig(settings);

    if (action === 'payment.updated') {
      const paymentId = webhookData.id;
      const status = await getPaymentStatus(paymentId, {
        accessToken: config.mercadopagoAccessToken,
      });

      if (status === 'approved') {
        const payment = await getPayment(paymentId, {
          accessToken: config.mercadopagoAccessToken,
        });
        const appointmentId = payment.external_reference;

        if (appointmentId) {
          db.prepare('UPDATE appointments SET status = ? WHERE id = ?')
            .run('confirmed', appointmentId);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
});

module.exports = router;

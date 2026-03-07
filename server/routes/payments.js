const express = require('express');
const router = express.Router();
const { createPaymentPreference, getPaymentStatus, getPayment, createPixPayment } = require('../integrations/mercadopago');
const { authenticate } = require('../middleware/auth');
const { getDb } = require('../database');

// Criar preferência de pagamento no Mercado Pago
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { appointmentId, servicePrice, paymentMethod = 'credit_card' } = req.body;
    const db = getDb();

    // Verificar agendamento
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND client_id = ?')
      .get(appointmentId, req.user.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }

    if (paymentMethod === 'pix') {
      // Criar pagamento PIX
      const pixPayment = await createPixPayment(appointmentId, servicePrice, req.user.email);
      res.json({
        ...pixPayment,
        paymentMethod: 'pix',
        appointmentId
      });
    } else {
      // Criar preferência de pagamento (cartão)
      const preference = await createPaymentPreference(appointmentId, servicePrice, req.user.email);
      res.json({
        ...preference,
        paymentMethod: 'credit_card',
        appointmentId
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verificar status do pagamento
router.get('/status/:paymentId', authenticate, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const status = await getPaymentStatus(paymentId);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Webhook do Mercado Pago
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    const { action, data: webhookData } = data;

    if (action === 'payment.updated') {
      const paymentId = webhookData.id;
      const status = await getPaymentStatus(paymentId);

      if (status === 'approved') {
        // Extrair appointmentId da referência externa
        const payment = await getPayment(paymentId);
        const appointmentId = payment.external_reference;

        if (appointmentId) {
          const db = getDb();
          // Atualizar status do agendamento para confirmado
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

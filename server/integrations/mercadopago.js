const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

function getClient(accessToken) {
  const token = accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
  if (!token) {
    throw new Error('Mercado Pago não configurado');
  }
  return new MercadoPagoConfig({ accessToken: token });
}

async function createPaymentPreference(appointmentId, servicePrice, clientEmail, options = {}) {
  try {
    const client = getClient(options.accessToken);
    const preference = new Preference(client);
    const backUrls = options.backUrls || {
      success: `http://localhost:5173/my-appointments?status=success&appointment=${appointmentId}`,
      failure: `http://localhost:5173/booking?status=failure`,
      pending: `http://localhost:5173/my-appointments?status=pending&appointment=${appointmentId}`,
    };
    const body = {
      items: [
        {
          title: options.title || 'Agendamento - PiresQK Barbearia',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(servicePrice),
        },
      ],
      payer: {
        email: clientEmail,
      },
      back_urls: backUrls,
      auto_return: 'approved',
      external_reference: appointmentId.toString(),
      notification_url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/payments/webhook`,
    };

    const response = await preference.create({ body });
    return { success: true, preferenceId: response.id, url: response.init_point };
  } catch (error) {
    console.error('Mercado Pago error:', error);
    throw error;
  }
}

async function getPaymentStatus(paymentId, options = {}) {
  try {
    const client = getClient(options.accessToken);
    const payment = new Payment(client);
    const response = await payment.get({ id: paymentId });
    return response.status;
  } catch (error) {
    console.error('Mercado Pago status error:', error);
    throw error;
  }
}

async function getPayment(paymentId, options = {}) {
  try {
    const client = getClient(options.accessToken);
    const payment = new Payment(client);
    return await payment.get({ id: paymentId });
  } catch (error) {
    console.error('Mercado Pago get payment error:', error);
    throw error;
  }
}

async function createPixPayment(appointmentId, servicePrice, clientEmail, options = {}) {
  try {
    const client = getClient(options.accessToken);
    const payment = new Payment(client);
    const body = {
      transaction_amount: parseFloat(servicePrice),
      description: options.title || 'Agendamento - PiresQK Barbearia',
      payment_method_id: 'pix',
      payer: {
        email: clientEmail,
      },
      external_reference: appointmentId.toString(),
      notification_url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/payments/webhook`,
    };

    const response = await payment.create({ body });
    
    return {
      success: true,
      paymentId: response.id,
      status: response.status,
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    };
  } catch (error) {
    console.error('Mercado Pago PIX error:', error);
    throw error;
  }
}

async function createCartPreference(items, clientEmail, options = {}) {
  try {
    const client = getClient(options.accessToken);
    const preference = new Preference(client);
    const body = {
      items: items.map((item) => ({
        title: item.name,
        quantity: Number(item.quantity) || 1,
        currency_id: 'BRL',
        unit_price: parseFloat(item.price),
      })),
      payer: {
        email: clientEmail,
      },
      back_urls: options.backUrls || {
        success: 'http://localhost:5173/services?checkout=success',
        failure: 'http://localhost:5173/services?checkout=failure',
        pending: 'http://localhost:5173/services?checkout=pending',
      },
      auto_return: 'approved',
      external_reference: `services-cart-${Date.now()}`,
      notification_url: `${process.env.BASE_URL || 'http://localhost:3001'}/api/payments/webhook`,
    };
    const response = await preference.create({ body });
    return { success: true, preferenceId: response.id, url: response.init_point };
  } catch (error) {
    console.error('Mercado Pago cart error:', error);
    throw error;
  }
}

module.exports = {
  createPaymentPreference,
  getPaymentStatus,
  getPayment,
  createPixPayment,
  createCartPreference,
};

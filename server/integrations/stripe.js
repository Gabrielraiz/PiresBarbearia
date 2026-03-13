const Stripe = require('stripe');

function getStripeClient(secretKey) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe não configurado');
  }
  return new Stripe(key);
}

async function createPaymentIntent(amount, appointmentId, clientEmail, options = {}) {
  try {
    const stripe = getStripeClient(options.secretKey);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'brl',
      payment_method_types: ['card'],
      metadata: {
        appointmentId,
        clientEmail,
      },
    });

    return { success: true, clientSecret: intent.client_secret };
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
}

async function confirmPayment(paymentIntentId, options = {}) {
  try {
    const stripe = getStripeClient(options.secretKey);
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status === 'succeeded';
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    throw error;
  }
}

async function createCheckoutSession(appointmentId, servicePrice, clientEmail, options = {}) {
  try {
    const stripe = getStripeClient(options.secretKey);
    const successUrl = options.successUrl || 'http://localhost:5173/my-appointments?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl = options.cancelUrl || 'http://localhost:5173/booking';
    const title = options.title || 'Agendamento - PiresQK Barbearia';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: title,
            },
            unit_amount: Math.round(servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId,
      },
    });

    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Stripe session error:', error);
    throw error;
  }
}

async function createCartCheckoutSession(items, clientEmail, options = {}) {
  try {
    const stripe = getStripeClient(options.secretKey);
    const successUrl = options.successUrl || 'http://localhost:5173/services?checkout=success';
    const cancelUrl = options.cancelUrl || 'http://localhost:5173/services?checkout=cancelled';
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: Number(item.quantity) || 1,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        source: 'services-cart',
      },
    });
    return { success: true, sessionId: session.id, url: session.url };
  } catch (error) {
    console.error('Stripe cart session error:', error);
    throw error;
  }
}

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createCheckoutSession,
  createCartCheckoutSession,
};

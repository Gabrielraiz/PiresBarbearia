const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, appointmentId, clientEmail) {
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
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

async function confirmPayment(paymentIntentId) {
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status === 'succeeded';
  } catch (error) {
    console.error('Stripe confirmation error:', error);
    throw error;
  }
}

async function createCheckoutSession(appointmentId, servicePrice, clientEmail) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Agendamento - PiresQK Barbearia',
            },
            unit_amount: Math.round(servicePrice * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/my-appointments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/booking`,
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

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createCheckoutSession,
};

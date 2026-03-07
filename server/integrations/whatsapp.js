const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsAppMessage(toNumber, message) {
  try {
    const msg = await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${toNumber}`,
      body: message,
    });
    return { success: true, messageId: msg.sid };
  } catch (error) {
    console.error('WhatsApp error:', error);
    throw error;
  }
}

async function sendAppointmentConfirmation(appointment, client) {
  const message = `
🎉 *Agendamento Confirmado!*

Olá ${client.name}!

Seu agendamento foi confirmado:
📅 Data: ${appointment.date}
⏰ Horário: ${appointment.time}
💈 Serviço: ${appointment.service_name}
👨‍💼 Barbeiro: ${appointment.barber_name}

Obrigado por escolher a PiresQK Barbearia! 💛
  `.trim();

  return sendWhatsAppMessage(client.phone, message);
}

module.exports = { sendWhatsAppMessage, sendAppointmentConfirmation };

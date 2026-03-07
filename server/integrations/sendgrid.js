const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'piresqk@barbearia.com',
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}

async function sendAppointmentConfirmationEmail(appointment, client) {
  const subject = `Confirmação de Agendamento - PiresQK Barbearia`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f5b800; color: #000; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-top: 20px; }
          .detail { margin: 10px 0; padding: 10px; background-color: #fff; border-left: 4px solid #f5b800; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
          .button { display: inline-block; background-color: #f5b800; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Agendamento Confirmado!</h1>
          </div>
          
          <div class="content">
            <p>Olá <strong>${client.name}</strong>,</p>
            <p>Seu agendamento na PiresQK Barbearia foi confirmado com sucesso!</p>
            
            <div class="detail">
              <strong>📅 Data:</strong> ${appointment.date}
            </div>
            <div class="detail">
              <strong>⏰ Horário:</strong> ${appointment.time}
            </div>
            <div class="detail">
              <strong>💈 Serviço:</strong> ${appointment.service_name}
            </div>
            <div class="detail">
              <strong>👨‍💼 Barbeiro:</strong> ${appointment.barber_name}
            </div>
            
            <p style="margin-top: 20px;">Obrigado por escolher a PiresQK Barbearia! 💛</p>
            
            <a href="http://localhost:5173/my-appointments" class="button">Ver Meus Agendamentos</a>
          </div>
          
          <div class="footer">
            <p>PiresQK Barbearia © 2024. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(client.email, subject, html);
}

module.exports = { sendEmail, sendAppointmentConfirmationEmail };

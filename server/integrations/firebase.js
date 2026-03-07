const admin = require('firebase-admin');

// Inicializar Firebase (usando variáveis de ambiente)
try {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.warn('Firebase não configurado completamente. Push notifications desativadas.');
}

async function sendPushNotification(deviceToken, title, body, data = {}) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Firebase push error:', error);
    throw error;
  }
}

async function sendAppointmentReminder(deviceToken, appointmentData) {
  const title = 'Lembrete de Agendamento';
  const body = `Seu agendamento de ${appointmentData.service_name} com ${appointmentData.barber_name} em ${appointmentData.time}`;
  const data = {
    appointmentId: appointmentData.id,
    type: 'appointment_reminder',
  };

  return sendPushNotification(deviceToken, title, body, data);
}

async function sendMulticastNotification(deviceTokens, title, body) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      tokens: deviceTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    return { success: true, successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error('Firebase multicast error:', error);
    throw error;
  }
}

module.exports = {
  sendPushNotification,
  sendAppointmentReminder,
  sendMulticastNotification,
};

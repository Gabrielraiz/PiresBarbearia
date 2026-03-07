const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

// Google OAuth Helper
async function verifyGoogleToken(token) {
  try {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
    
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.VITE_GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Token inválido');
  }
}

// Facebook OAuth Helper
async function verifyFacebookToken(token) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`);
    const data = await response.json();

    if (!data.id) throw new Error('Token inválido');
    return data;
  } catch (error) {
    console.error('Facebook token verification error:', error);
    throw new Error('Token do Facebook inválido');
  }
}

// Sincronizar ou criar usuário do OAuth
async function syncOAuthUser(profile, provider) {
  const db = getDb();

  // Verificar se usuário existe
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(profile.email);

  if (!user) {
    // Criar novo usuário
    const result = db.prepare(`
      INSERT INTO users (name, email, phone, photo, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(profile.name, profile.email, null, profile.picture || null, 'client');

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  } else {
    // Atualizar foto se fornecida
    if (profile.picture) {
      db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(profile.picture, user.id);
      user.photo = profile.picture;
    }
  }

  // Gerar JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      photo: user.photo,
    },
  };
}

module.exports = {
  verifyGoogleToken,
  verifyFacebookToken,
  syncOAuthUser,
};

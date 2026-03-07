const express = require('express');
const router = express.Router();
const { verifyGoogleToken, verifyFacebookToken, syncOAuthUser } = require('../integrations/oauth');

// Google Login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token não fornecido' });
    }

    // Verificar token do Google
    const profile = await verifyGoogleToken(token);

    // Sincronizar ou criar usuário
    const result = await syncOAuthUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    }, 'google');

    res.json(result);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: error.message || 'Falha na autenticação do Google' });
  }
});

// Facebook Login
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ message: 'Access token não fornecido' });
    }

    // Verificar token do Facebook
    const profile = await verifyFacebookToken(accessToken);

    // Sincronizar ou criar usuário
    const result = await syncOAuthUser({
      name: profile.name,
      email: profile.email,
      picture: profile.picture?.data?.url,
    }, 'facebook');

    res.json(result);
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(401).json({ message: error.message || 'Falha na autenticação do Facebook' });
  }
});

module.exports = router;

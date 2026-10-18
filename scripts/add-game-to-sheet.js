/**
 * Script para agregar juegos directamente a Google Sheets de TiagoTech
 * Incluye autenticación con clave secreta (Token de seguridad)
 */

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby3s7hhrsbJ1c5e7ghqMACa3ergSTWJ8zDY-Xu5gpE9XXY-lO2F8ys6Y39GgJWtFNlU/exec';
const SECRET_KEY = 'TiagoTech_Secure_2026_Key';

async function addGame(gameData) {
  console.log(`🔒 Enviando "${gameData.titulo}" con autenticación segura a Google Sheets...`);
  try {
    const payload = {
      ...gameData,
      secret_key: SECRET_KEY // Candado de seguridad
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    });

    const text = await res.text();
    console.log('Respuesta de Google Sheets:', text);
  } catch (err) {
    console.error('Error al enviar juego:', err);
  }
}

// Ejecutar si se pasa argumento por CLI
if (process.argv[2]) {
  try {
    const data = JSON.parse(process.argv[2]);
    addGame(data);
  } catch (e) {
    console.error('Argumento JSON no válido:', e.message);
  }
} else {
  console.log('Módulo cargado. Exportando función addGame protegida.');
}

module.exports = { addGame, WEBHOOK_URL, SECRET_KEY };

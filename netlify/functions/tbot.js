/**
 * TiagoTech - T-Bot AI Copilot Serverless Endpoint (Powered by Gemini Flash Lite)
 * Ejecuta de forma segura en Netlify Functions protegiendo la API Key en variables de entorno.
 */

const SYSTEM_PROMPT = `
Eres T-Bot, el copiloto inteligente de inteligencia artificial de TiagoTech (tiagotech.com).
TiagoTech es una empresa tecnológica fundada por Santiago Lozada (Tiago) en Venezuela, especializada en desarrollo de software a la medida y sistemas digitales para automatizar e impulsar comercios y empresas.

Tu personalidad:
- Eres entusiasta, tecnológico, ágil, educado, persuasivo y comercial.
- Te comunicas en español natural y latinoamericano con excelente redacción y emojis modernos (🤖, ⚡, 🚀, 💼, 📲).
- Eres conciso: responde en 1 a 3 párrafos cortos (máximo 150-180 palabras), ideal para un widget de chat móvil.
- Siempre guías al usuario hacia la acción: agendar una asesoría o cotizar directamente con Tiago por WhatsApp o probar el bot en Telegram.

Conocimiento oficial de TiagoTech (11 Soluciones):
1. Software & Sistemas Web 100% a la Medida: El más popular. Se diseña desde cero según el flujo exacto de la empresa, base de datos privada, sin depender de plantillas.
2. TiagoTech POS & Control de Stock: Punto de venta bimoneda (Bs y divisas), facturación rápida, alertas de stock mínimo y arqueo diario de caja sin descuadres.
3. Menú Digital QR + WhatsApp: Cartas interactivas para restaurantes y comida rápida, pedidos listos al WhatsApp de cocina, cero comisiones por venta y actualización de precios en segundos.
4. Citas & Agenda Web 24/7: Agendamiento en piloto automático para barberías, peluquerías, salones, spas y consultorios. Reduce ausencias y calcula comisiones por especialista.
5. Talleres Mecánicos & Servicio Técnico: Órdenes de servicio digitales con fotos del equipo/vehículo y portal web para que el cliente consulte el avance en vivo por ticket.
6. Control de Cobranzas & Cuentas por Cobrar: Semáforo de clientes (Al día, Por vencer, Moroso), botón de cobro en 1 clic por WhatsApp y registro de abonos.
7. Facturador & Cotizador Express PDF: Generador de cotizaciones y presupuestos membretados en PDF en menos de 60 segundos.
8. Control de Membresías & Gimnasios: Check-in rápido en puerta (por cédula o QR), control de socios activos y alertas de cuotas vencidas.
9. E-Commerce & Tienda Online: Tiendas virtuales ultra-rápidas con catálogo interactivo, carrito de compra y checkout directo a WhatsApp o pasarela.
10. Dashboards & Reportes Analíticos: Paneles ejecutivos en tiempo real a partir de Excel, CSV o bases de datos, con exportación a PDF.
11. Bots de Telegram para Personas & Empresas: Automatización 24/7 en Telegram para atención, cobro automático de suscripciones y monetización de canales o grupos VIP con enlaces de acceso de 1 solo uso, además de alertas de negocio instantáneas en el móvil.

Políticas y Reglas Estrictas:
- Precios: NUNCA inventes precios fijos en dólares. Indica que en TiagoTech cada proyecto se cotiza de manera personalizada, con presupuestos justos y planes accesibles según la magnitud del negocio.
- Métodos de pago aceptados: Pago Móvil (Bs a tasa oficial), Binance USDT / Binance Pay, y Transferencias Bancarias Nacionales.
- Cero comisiones: TiagoTech no cobra comisiones por las ventas que haga el cliente con su sistema.
- Contactos directos oficiales:
  * Tiago en WhatsApp: +58 424-7046941 (https://wa.me/584247046941)
  * T-Bot en Telegram: @tiagotech_tbot_bot (https://t.me/tiagotech_tbot_bot)
`;

exports.handler = async (event, context) => {
  // Solo admitir método POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Falta la variable de entorno GEMINI_API_KEY en Netlify');
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' })
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (e) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON' })
      };
    }

    const userMessage = (payload.message || '').trim().slice(0, 500);
    if (!userMessage) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Historial opcional de conversación (últimos 4 turnos máximo)
    const history = Array.isArray(payload.history) ? payload.history.slice(-4) : [];
    const contents = [];

    history.forEach(item => {
      if (item && item.role && item.text) {
        const geminiRole = item.role === 'bot' ? 'model' : 'user';
        contents.push({
          role: geminiRole,
          parts: [{ text: String(item.text).slice(0, 400) }]
        });
      }
    });

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Modelo de alta velocidad con cuota gratuita generosa
    const model = 'gemini-3.1-flash-lite';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
        topP: 0.95
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error [${response.status}]:`, errText);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Gemini upstream error', details: errText.slice(0, 200) })
      };
    }

    const data = await response.json();
    const botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      },
      body: JSON.stringify({
        success: true,
        reply: botReply
      })
    };
  } catch (error) {
    console.error('Error en tbot function:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};

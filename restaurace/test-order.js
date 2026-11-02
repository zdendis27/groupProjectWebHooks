const { randomUUID } = require('node:crypto');

const courierUrl = process.env.COURIER_URL || 'http://localhost:3000/order';
const order = {
  id: process.argv[2] || randomUUID(),
  callbackUrl: process.env.CALLBACK_URL || 'http://localhost:3001/update'
};

async function sendOrder() {
  console.log('Odesílám objednávku:', order);

  const response = await fetch(courierUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
    signal: AbortSignal.timeout(10000)
  });

  console.log('Courier response:', response.status);

  // Přijetí objednávky potvrzuje status 202, tělo odpovědi nepotřebujeme.
  if (response.status !== 202) {
    throw new Error(`Kurýr objednávku nepotvrdil, HTTP ${response.status}.`);
  }
}

sendOrder().catch((error) => {
  console.error('Objednávku se nepodařilo odeslat:', error.message);
  process.exitCode = 1;
});

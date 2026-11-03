const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Delivery phases sent to the restaurant's webhook, with delay (ms) after the order was accepted
const STATUS_STEPS = [
  { status: 'Restaurace připravuje', delay: 5000 },
  { status: 'Rozváží se', delay: 10000 },
  { status: 'Doručeno', delay: 15000 }
];

// Sends one status update to the restaurant's callbackUrl (webhook)
function sendStatusUpdate(order, status) {
  fetch(order.callbackUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: order.id, status: status })
  })
    .then(res => {
      console.log(`${order.id}: ${status} (restaurace odpověděla ${res.status})`);
    })
    .catch(err => {
      // Without catch, an unreachable restaurant would crash the whole courier server
      console.error(`${order.id}: stav "${status}" se nepodařilo doručit – ${err.message}`);
    });
}

// Endpoint pro přijetí nové objednávky
app.post('/order', (req, res) => {
  const order = req.body;

  // Reject orders that are missing the agreed fields
  if (!order || !order.id || !order.callbackUrl) {
    return res.status(400).json({ error: 'Objednávka musí obsahovat id a callbackUrl' });
  }

  console.log(`Přijata objednávka ${order.id}`);

  // Okamžité potvrzení přijetí objednávky
  res.sendStatus(202);

  // Schedule each delivery phase; every order gets its own independent timers
  for (const step of STATUS_STEPS) {
    setTimeout(() => sendStatusUpdate(order, step.status), step.delay);
  }
});

app.listen(PORT, () => {
  console.log(`Courier runs on http://localhost:${PORT}`);
});

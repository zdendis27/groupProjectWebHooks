const express = require('express');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3001;

// Shared secret for verifying webhooks – must be the same on the courier side
const SHARED_SECRET = process.env.SHARED_SECRET || 'tajne-heslo';

// Parse JSON and also keep the raw body – the signature is computed from the exact bytes received
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));
app.use(express.static('public'));  // serves public/index.html at http://localhost:3001/

const orders = {};  // jednoduché úložiště stavů objednávek
const processedEvents = new Set();  // event_id of webhooks that were already processed

// Webhook endpoint the courier calls with order status updates
app.post('/update', (req, res) => {
  const sigHeader = (req.get('X-Signature') || '').trim();
  const rawBody = req.rawBody || Buffer.from('');
  const expected = crypto.createHmac('sha256', SHARED_SECRET)
                         .update(rawBody)
                         .digest('hex');

  // Timing-safe comparison; buffers must have equal length, otherwise timingSafeEqual throws
  const a = Buffer.from(sigHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    console.log('Odmítnut webhook s neplatným podpisem');
    return res.sendStatus(401);
  }

  const { event_id, id, status } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: 'Webhook musí obsahovat event_id' });
  }

  // Duplicate event: already processed, so skip it but still answer 200 (the courier then stops retrying)
  if (processedEvents.has(event_id)) {
    console.log(`Duplicitní událost ${event_id} (${id}: ${status}) – ignorováno`);
    return res.sendStatus(200);
  }
  processedEvents.add(event_id);

  orders[id] = status;
  console.log(`Objednávka ${id}: ${status}`);
  res.sendStatus(200);
});

// Shows current status of all orders (open http://localhost:3001/orders in a browser)
app.get('/orders', (req, res) => {
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Restaurant runs on http://localhost:${port}`);
});

// Minimal stand-in for the restaurant server, so the courier team can test webhooks on its own.
// Run: npm run mock-restaurant  (listens on port 3001, same as the real restaurant)
const express = require('express');
const app = express();
app.use(express.json());

const orders = {}; // order id -> current status

// Webhook endpoint the courier calls with status updates
app.post('/update', (req, res) => {
  const { id, status } = req.body;
  orders[id] = status;
  console.log(`Webhook: ${id} -> ${status}`);
  res.sendStatus(200);
});

// Shows all stored order statuses (open http://localhost:3001/orders in a browser)
app.get('/orders', (req, res) => {
  res.json(orders);
});

app.listen(3001, () => {
  console.log('Mock restaurant runs on http://localhost:3001');
});

const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static('public'));  // serves public/index.html at http://localhost:3001/

const orders = {};  // jednoduché úložiště stavů objednávek

// Webhook endpoint the courier calls with order status updates
app.post('/update', (req, res) => {
  const { id, status } = req.body;
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

// Simulates the restaurant sending a delivery request to the courier server.
// Start the server first (npm start), then run: node test-order.js
fetch('http://localhost:3000/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'objednavka1',
    callbackUrl: 'http://localhost:3001/update'
  })
})
  .then(res => res.status)
  .then(status => console.log('Courier response:', status));

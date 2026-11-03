// Simulates the restaurant sending delivery requests to the courier server.
// Start the server first (npm start), then run:
//   node test-order.js      -> sends 1 order
//   node test-order.js 3    -> sends 3 orders at once (tests parallel processing)
const count = Number(process.argv[2]) || 1;

for (let i = 1; i <= count; i++) {
  fetch('http://localhost:3000/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'objednavka' + i,
      callbackUrl: 'http://localhost:3001/update'
    })
  })
    .then(res => res.status)
    .then(status => console.log(`objednavka${i} – Courier response:`, status))
    .catch(err => console.error('Courier is not reachable – is the server running?', err.message));
}

const express = require('express');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Endpoint pro příjem webhooků /update přidáme v další úloze.
app.listen(port, () => {
  console.log(`Restaurant runs on http://localhost:${port}`);
});

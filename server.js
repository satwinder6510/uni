const path    = require('path');
const express = require('express');
const api     = require('./api/index.js');

const app = express();
app.use(express.json());

app.use('/api', api);

const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

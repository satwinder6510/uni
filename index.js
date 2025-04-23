const express = require('express');
const axios   = require('axios');
const dayjs   = require('dayjs');
const pLimit  = require('p-limit').default;

const SERPAPI_KEY = process.env.SERPAPI_KEY;
if (!SERPAPI_KEY) {
  console.error('Missing SERPAPI_KEY');
  process.exit(1);
}

const app = express();
app.use(express.json());

function buildParams({ type, from, to, outDate, backDate, currency, gl, multiCity }) {
  const p = { engine: 'google_flights', api_key: SERPAPI_KEY, type, adults:1, hl:'en', currency, gl };
  if (from) p.departure_id = from;
  if (to) p.arrival_id = to;
  if (outDate) p.outbound_date = outDate;
  if (backDate) p.return_date = backDate;
  if (multiCity) p.multi_city_json = JSON.stringify(multiCity);
  return p;
}
const pickFirst = d => d?.best_flights?.[0] || d?.other_flights?.[0] || null;

app.get('/calendar', async (req, res) => {
  let { from, to, month } = req.query;
  if (!from || !to) return res.status(400).json({ error:'from and to required' });
  if (!month) month = dayjs().format('YYYY-MM');
  const start = dayjs(month,'YYYY-MM').startOf('month');
  const currency = (req.query.currency||'GBP').toUpperCase();
  const gl = (req.query.gl||'uk').toLowerCase();
  const limit = pLimit(5);
  const tasks = Array.from({ length: start.daysInMonth() }, (_,i) => {
    const date = start.add(i,'day').format('YYYY-MM-DD');
    return limit(async() => {
      const params = buildParams({ type:2, from, to, outDate:date, currency, gl });
      const { data } = await axios.get('https://serpapi.com/search',{ params });
      const f = pickFirst(data);
      return { date, price: f?.price?.raw ?? null };
    });
  });
  res.json(await Promise.all(tasks));
});
app.post('/multicity-calendar', (req, res) => res.json([]));
module.exports = app;
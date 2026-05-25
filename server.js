const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint — keeps API calls server-side and lets us add timeout handling
app.get('/api/country/:name', async (req, res) => {
  const name = req.params.name.trim();

  // Reject empty strings or anything absurdly long before hitting the API
  if (!name || name.length > 100) {
    return res.status(400).json({ error: 'Invalid country name.' });
  }

  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,population,region,subregion,languages,currencies,flags,area`;

  // AbortController lets us cancel the fetch after 7 seconds
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (response.status === 404) {
      return res.status(404).json({ error: `No country found matching "${name}".` });
    }

    if (!response.ok) {
      return res.status(502).json({
        error: `The countries API returned an error (HTTP ${response.status}). Try again shortly.`
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    clearTimeout(timeout);

    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timed out — the countries API is taking too long. Please try again.'
      });
    }

    console.error('Fetch error:', err.message);
    res.status(502).json({ error: 'Could not reach the countries API. Check your internet connection.' });
  }
});

app.listen(PORT, () => {
  console.log(`Country Compare running at http://localhost:${PORT}`);
});

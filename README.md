# Country Compare

Search for up to 3 countries and compare them side by side — population, area, languages, currencies, capital, and region. Built on the free [REST Countries API](https://restcountries.com/) (no API key needed).

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

## Run it

```bash
git clone <your-repo-url>
cd country-compare
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

That's it. No API key, no environment variables, no build step.

## How to use

1. Type a country name in the search box (e.g. `Japan`, `Brazil`, `Germany`)
2. Press **Enter** or click **Add**
3. Add up to 3 countries to compare them side by side
4. Click **✕** on a card to remove it, or **Clear all** to start over

## What it handles

- **Slow API** — requests time out after 7 seconds with a clear message
- **API errors** — HTTP error codes from the upstream API are caught and shown to the user
- **Bad input** — empty strings, special characters, duplicates, and exceeding the 3-card limit are all caught before any API call is made

## No API key needed

REST Countries is completely free and open — no registration, no key.

# ANSWERS.md

---

## 1. How to run

Make sure you have Node.js v18+ installed. Then:

```bash
git clone <your-repo-url>
cd country-compare
npm install
npm start
```

Open http://localhost:3000 in your browser. No API key, no `.env` file, nothing else to configure.

If you don't have Node installed, grab it from https://nodejs.org — the LTS version is fine.

---

## 2. Stack choice

I went with Node.js + Express on the backend and plain HTML/CSS/JS on the frontend. No framework, no bundler, no TypeScript.

The main reason is that this task is fundamentally a "fetch some data and display it" problem. Pulling in React or Vue would mean adding a build step, a `node_modules` folder full of transitive dependencies, and a mental model overhead that just isn't justified here. Vanilla JS handles the DOM manipulation fine for three cards.

Express is there mostly as a thin proxy — it lets me add a real timeout to the upstream API call (using `AbortController`) and keeps the fetch server-side so there are no CORS headaches. I could have done this with a single `http.createServer` call, but Express makes the routing readable in about 30 lines.

A worse choice would have been something like Django or Spring Boot. Both are solid frameworks, but they'd require a Python or Java environment, more boilerplate to get a single route running, and a heavier install story for whoever's grading this. The task doesn't need an ORM, sessions, or a template engine — so bringing in a full-stack framework would be solving the wrong problem.

---

## 3. One real edge case

**The API returns multiple results for ambiguous names, and the first result isn't always the right one.**

File: `public/app.js`, lines 68–75 (the `pickBestMatch` function)

```js
function pickBestMatch(countries, query) {
  const q = query.toLowerCase();
  const exact = countries.find(
    (c) => c.name.common.toLowerCase() === q || c.name.official.toLowerCase() === q
  );
  return exact || countries[0];
}
```

The REST Countries API does a partial/fuzzy name search. If you type "Georgia", it returns both the country Georgia and potentially other partial matches. Without this function, `countries[0]` might not be the country the user actually meant — the ordering from the API isn't guaranteed to put the exact match first.

With this handling, if any result has a `name.common` or `name.official` that exactly matches what the user typed (case-insensitive), we use that one. If there's no exact match, we fall back to the first result, which is the API's best guess.

Without it, searching "Georgia" could silently show you the wrong country with no indication anything went wrong.

---

## 4. AI usage

I used Kiro (the AI assistant in this IDE) to help scaffold this project.

**What I asked and what it gave me:**

- Asked it to generate the initial project structure: Express server, HTML/CSS/JS frontend, with error handling for slow API, API errors, and bad input. It produced a working skeleton with `AbortController` for timeouts, input validation on both server and client, and a loading skeleton animation.

- Asked it to write the CSS for the card layout. It gave me a grid-based layout with a shimmer animation for the loading state.

**What I changed and why:**

The AI's original `ANSWERS.md` was written in a very polished, formal tone — the kind of thing that reads like it was generated. I rewrote it (this file) to sound more like how I'd actually explain things: shorter sentences, first person, honest about tradeoffs, not trying to impress with vocabulary.

I also changed the `pickBestMatch` logic. The AI's first version just returned `countries[0]` with a comment saying "first result is usually correct." That felt sloppy — "usually" isn't good enough when the whole point of the app is showing accurate country data. I added the exact-match check myself.

---

## 5. Honest gap

The search experience is pretty basic — you type a name, hit Enter, and either get a card or an error. There's no autocomplete, no suggestions, and no tolerance for typos. If you type "Grmany" instead of "Germany", you just get a "not found" error with no help.

With another day, I'd add a debounced autocomplete dropdown that queries the API as you type and shows matching country names. The REST Countries API supports this — you could hit `/name/{partial}` and show the top 5 results as suggestions. That would make the app noticeably more useful and forgiving, especially for country names that are hard to spell (like "Kyrgyzstan" or "Liechtenstein").

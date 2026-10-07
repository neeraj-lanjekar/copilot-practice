# OctoFit Tracker presentation tier

The React 19 presentation tier uses Vite, React Router, and Bootstrap. Start it
from the repository root with:

```bash
npm --prefix octofit-tracker/frontend run dev
```

The frontend calls the API on port `8000`. Define Vite's
`VITE_CODESPACE_NAME` in `octofit-tracker/frontend/.env.local` when using a
Codespaces API URL. For example:

```dotenv
VITE_CODESPACE_NAME=your-codespace-name
```

Vite reads this variable at startup, so restart the dev server after changing
`.env.local`. When it is unset, the app safely falls back to
`http://localhost:8000`.

The application includes pages for `/activities`, `/leaderboard`, `/teams`,
`/users`, and `/workouts`. Collection pages accept both plain JSON arrays and
paginated responses containing a `results` or `data` array.

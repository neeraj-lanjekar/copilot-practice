# OctoFit Tracker API

The backend is an Express API written in TypeScript, with MongoDB access through
Mongoose. Start MongoDB, then run the API from the repository root:

```bash
npm --prefix octofit-tracker/backend run dev
```

The API listens on port `8000`. Set `MONGODB_URI` to override the default
`mongodb://localhost:27017/octofit_db`.

Load or refresh the repeatable sample data with:

```bash
npm --prefix octofit-tracker/backend run seed
```

## Endpoints

- `GET /api` lists the API endpoints and base URL.
- `GET /api/health` reports API and database connection status.
- `GET|POST /api/users`, `GET|PATCH|DELETE /api/users/:id`
- `GET|POST /api/teams`, `GET|PATCH|DELETE /api/teams/:id`
- `GET|POST /api/activities`, `PATCH|DELETE /api/activities/:id`;
  optionally filter with `?user=<user-id>`
- `GET|POST /api/leaderboard`, `PATCH|DELETE /api/leaderboard/:id`;
  optionally choose `?period=weekly|monthly|all-time`
- `GET|POST /api/workouts`, `PATCH|DELETE /api/workouts/:id`

Create requests send JSON matching the resource's Mongoose schema. Invalid
documents receive a `400` response, duplicate unique values receive `409`, and
unknown routes receive `404`.

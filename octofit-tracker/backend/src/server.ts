import express from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { createApiRouter } from './routes/api.js';

const app = express();
const port = Number(process.env.PORT) || 8000;
const codespaceName = process.env.CODESPACE_NAME;
const baseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());

app.use((_request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS',
  );
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.use(createApiRouter(baseUrl));

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof mongoose.Error.ValidationError) {
      response.status(400).json({ error: error.message });
      return;
    }
    if (error instanceof mongoose.Error.CastError) {
      response.status(400).json({ error: 'Invalid resource data' });
      return;
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      response.status(409).json({ error: 'A resource with that value already exists' });
      return;
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number'
    ) {
      response.status(error.status).json({
        error: error instanceof Error ? error.message : 'Invalid request',
      });
      return;
    }
    console.error('Unhandled API error:', error);
    response.status(500).json({ error: 'Internal server error' });
  },
);

async function startServer(): Promise<void> {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`OctoFit API listening at ${baseUrl} on port ${port}`);
  });
}

void startServer().catch((error: unknown) => {
  console.error('Unable to start OctoFit API:', error);
  process.exitCode = 1;
});
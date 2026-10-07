import { Router } from 'express';
import mongoose from 'mongoose';
import { Activity, Leaderboard, Team, User, Workout } from '../models/index.js';

const apiRouter = Router();

function requestBody(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw Object.assign(new Error('Request body must be a JSON object'), {
      status: 400,
    });
  }
  return body as Record<string, unknown>;
}

function validateId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw Object.assign(new Error('Invalid resource ID'), { status: 400 });
  }
}

function updatePayload(body: unknown, fields: string[]): Record<string, unknown> {
  const input = requestBody(body);
  const payload = Object.fromEntries(
    fields
      .filter((field) => Object.hasOwn(input, field))
      .map((field) => [field, input[field]]),
  );
  if (Object.keys(payload).length === 0) {
    throw Object.assign(new Error('Request body contains no editable fields'), {
      status: 400,
    });
  }
  return payload;
}

apiRouter.get('/', (_request, response) => {
  const codespaceName = process.env.CODESPACE_NAME;
  const baseUrl = codespaceName
    ? `https://${codespaceName}-8000.app.github.dev`
    : 'http://localhost:8000';

  response.json({
    name: 'OctoFit Tracker API',
    baseUrl,
    endpoints: [
      '/api/health',
      '/api/users',
      '/api/teams',
      '/api/activities',
      '/api/leaderboard',
      '/api/workouts',
    ],
  });
});

apiRouter.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

apiRouter.get('/users', async (_request, response) => {
  response.json(await User.find().sort({ username: 1 }).lean());
});

apiRouter.post('/users', async (request, response) => {
  const user = await User.create(requestBody(request.body));
  response.status(201).json(user);
});

apiRouter.get('/users/:id', async (request, response) => {
  validateId(request.params.id);
  const user = await User.findById(request.params.id).lean();
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});

apiRouter.patch('/users/:id', async (request, response) => {
  validateId(request.params.id);
  const user = await User.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, ['username', 'email', 'displayName']),
    { new: true, runValidators: true },
  ).lean();
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(user);
});

apiRouter.delete('/users/:id', async (request, response) => {
  validateId(request.params.id);
  const user = await User.findByIdAndDelete(request.params.id);
  if (!user) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.status(204).end();
});

apiRouter.get('/teams', async (_request, response) => {
  response.json(await Team.find().populate('members', 'username displayName').lean());
});

apiRouter.post('/teams', async (request, response) => {
  const team = await Team.create(requestBody(request.body));
  response.status(201).json(team);
});

apiRouter.patch('/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const team = await Team.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, ['name', 'description', 'members']),
    { new: true, runValidators: true },
  )
    .populate('members', 'username displayName')
    .lean();
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});

apiRouter.delete('/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const team = await Team.findByIdAndDelete(request.params.id);
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.status(204).end();
});

apiRouter.get('/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const team = await Team.findById(request.params.id)
    .populate('members', 'username displayName')
    .lean();
  if (!team) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(team);
});

apiRouter.get('/activities', async (request, response) => {
  const filter: { user?: string } = {};
  if (typeof request.query.user === 'string') {
    validateId(request.query.user);
    filter.user = request.query.user;
  }
  response.json(
    await Activity.find(filter)
      .populate('user', 'username displayName')
      .sort({ loggedAt: -1 })
      .lean(),
  );
});

apiRouter.post('/activities', async (request, response) => {
  const activity = await Activity.create(requestBody(request.body));
  response.status(201).json(activity);
});

apiRouter.patch('/activities/:id', async (request, response) => {
  validateId(request.params.id);
  const activity = await Activity.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, [
      'user',
      'type',
      'durationMinutes',
      'caloriesBurned',
      'loggedAt',
    ]),
    { new: true, runValidators: true },
  )
    .populate('user', 'username displayName')
    .lean();
  if (!activity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  response.json(activity);
});

apiRouter.delete('/activities/:id', async (request, response) => {
  validateId(request.params.id);
  const activity = await Activity.findByIdAndDelete(request.params.id);
  if (!activity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  response.status(204).end();
});

apiRouter.get('/leaderboard', async (request, response) => {
  const period =
    typeof request.query.period === 'string' ? request.query.period : 'weekly';
  if (!['weekly', 'monthly', 'all-time'].includes(period)) {
    response.status(400).json({ error: 'Period must be weekly, monthly, or all-time' });
    return;
  }
  response.json(
    await Leaderboard.find({ period })
      .populate('user', 'username displayName')
      .populate('team', 'name')
      .sort({ points: -1 })
      .lean(),
  );
});

apiRouter.post('/leaderboard', async (request, response) => {
  const entry = await Leaderboard.create(requestBody(request.body));
  response.status(201).json(entry);
});

apiRouter.patch('/leaderboard/:id', async (request, response) => {
  validateId(request.params.id);
  const entry = await Leaderboard.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, ['user', 'team', 'period', 'points']),
    { new: true, runValidators: true },
  )
    .populate('user', 'username displayName')
    .populate('team', 'name')
    .lean();
  if (!entry) {
    response.status(404).json({ error: 'Leaderboard entry not found' });
    return;
  }
  response.json(entry);
});

apiRouter.delete('/leaderboard/:id', async (request, response) => {
  validateId(request.params.id);
  const entry = await Leaderboard.findByIdAndDelete(request.params.id);
  if (!entry) {
    response.status(404).json({ error: 'Leaderboard entry not found' });
    return;
  }
  response.status(204).end();
});

apiRouter.get('/workouts', async (_request, response) => {
  response.json(await Workout.find().sort({ createdAt: -1 }).lean());
});

apiRouter.post('/workouts', async (request, response) => {
  const workout = await Workout.create(requestBody(request.body));
  response.status(201).json(workout);
});

apiRouter.patch('/workouts/:id', async (request, response) => {
  validateId(request.params.id);
  const workout = await Workout.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, [
      'title',
      'description',
      'category',
      'durationMinutes',
      'difficulty',
    ]),
    { new: true, runValidators: true },
  ).lean();
  if (!workout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.json(workout);
});

apiRouter.delete('/workouts/:id', async (request, response) => {
  validateId(request.params.id);
  const workout = await Workout.findByIdAndDelete(request.params.id);
  if (!workout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.status(204).end();
});

export default apiRouter;

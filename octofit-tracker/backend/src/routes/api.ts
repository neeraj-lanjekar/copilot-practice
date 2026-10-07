import { Router } from 'express';
import mongoose from 'mongoose';
import activity from '../models/Activity.js';
import leaderboard from '../models/Leaderboard.js';
import team from '../models/Team.js';
import user from '../models/User.js';
import workout from '../models/Workout.js';

export function createApiRouter(baseUrl: string): Router {
  const router = Router();

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

  router.get('/api', (_request, response) => {
    response.json({
      name: 'OctoFit Tracker API',
      baseUrl,
      endpoints: [
        '/api/health/',
        '/api/users/',
        '/api/teams/',
        '/api/activities/',
        '/api/leaderboard/',
        '/api/workouts/',
      ],
    });
  });

router.get('/api/health/', (_request, response) => {
  response.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

router.get('/api/users/', async (_request, response) => {
  response.json(await user.find().sort({ username: 1 }).lean());
});

router.post('/api/users/', async (request, response) => {
  const createdUser = await user.create(requestBody(request.body));
  response.status(201).json(createdUser);
});

router.get('/api/users/:id', async (request, response) => {
  validateId(request.params.id);
  const foundUser = await user.findById(request.params.id).lean();
  if (!foundUser) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(foundUser);
});

router.patch('/api/users/:id', async (request, response) => {
  validateId(request.params.id);
  const updatedUser = await user.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, ['username', 'email', 'displayName']),
    { new: true, runValidators: true },
  ).lean();
  if (!updatedUser) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.json(updatedUser);
});

router.delete('/api/users/:id', async (request, response) => {
  validateId(request.params.id);
  const deletedUser = await user.findByIdAndDelete(request.params.id);
  if (!deletedUser) {
    response.status(404).json({ error: 'User not found' });
    return;
  }
  response.status(204).end();
});

router.get('/api/teams/', async (_request, response) => {
  response.json(await team.find().populate('members', 'username displayName').lean());
});

router.post('/api/teams/', async (request, response) => {
  const createdTeam = await team.create(requestBody(request.body));
  response.status(201).json(createdTeam);
});

router.patch('/api/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const updatedTeam = await team.findByIdAndUpdate(
    request.params.id,
    updatePayload(request.body, ['name', 'description', 'members']),
    { new: true, runValidators: true },
  )
    .populate('members', 'username displayName')
    .lean();
  if (!updatedTeam) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(updatedTeam);
});

router.delete('/api/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const deletedTeam = await team.findByIdAndDelete(request.params.id);
  if (!deletedTeam) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.status(204).end();
});

router.get('/api/teams/:id', async (request, response) => {
  validateId(request.params.id);
  const foundTeam = await team.findById(request.params.id)
    .populate('members', 'username displayName')
    .lean();
  if (!foundTeam) {
    response.status(404).json({ error: 'Team not found' });
    return;
  }
  response.json(foundTeam);
});

router.get('/api/activities/', async (request, response) => {
  const filter: { user?: string } = {};
  if (typeof request.query.user === 'string') {
    validateId(request.query.user);
    filter.user = request.query.user;
  }
  response.json(
    await activity.find(filter)
      .populate('user', 'username displayName')
      .sort({ loggedAt: -1 })
      .lean(),
  );
});

router.post('/api/activities/', async (request, response) => {
  const createdActivity = await activity.create(requestBody(request.body));
  response.status(201).json(createdActivity);
});

router.patch('/api/activities/:id', async (request, response) => {
  validateId(request.params.id);
  const updatedActivity = await activity.findByIdAndUpdate(
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
  if (!updatedActivity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  response.json(updatedActivity);
});

router.delete('/api/activities/:id', async (request, response) => {
  validateId(request.params.id);
  const deletedActivity = await activity.findByIdAndDelete(request.params.id);
  if (!deletedActivity) {
    response.status(404).json({ error: 'Activity not found' });
    return;
  }
  response.status(204).end();
});

router.get('/api/leaderboard/', async (request, response) => {
  const period =
    typeof request.query.period === 'string' ? request.query.period : 'weekly';
  if (!['weekly', 'monthly', 'all-time'].includes(period)) {
    response.status(400).json({ error: 'Period must be weekly, monthly, or all-time' });
    return;
  }
  response.json(
    await leaderboard.find({ period })
      .populate('user', 'username displayName')
      .populate('team', 'name')
      .sort({ points: -1 })
      .lean(),
  );
});

router.post('/api/leaderboard/', async (request, response) => {
  const entry = await leaderboard.create(requestBody(request.body));
  response.status(201).json(entry);
});

router.patch('/api/leaderboard/:id', async (request, response) => {
  validateId(request.params.id);
  const entry = await leaderboard.findByIdAndUpdate(
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

router.delete('/api/leaderboard/:id', async (request, response) => {
  validateId(request.params.id);
  const entry = await leaderboard.findByIdAndDelete(request.params.id);
  if (!entry) {
    response.status(404).json({ error: 'Leaderboard entry not found' });
    return;
  }
  response.status(204).end();
});

router.get('/api/workouts/', async (_request, response) => {
  response.json(await workout.find().sort({ createdAt: -1 }).lean());
});

router.post('/api/workouts/', async (request, response) => {
  const createdWorkout = await workout.create(requestBody(request.body));
  response.status(201).json(createdWorkout);
});

router.patch('/api/workouts/:id', async (request, response) => {
  validateId(request.params.id);
  const updatedWorkout = await workout.findByIdAndUpdate(
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
  if (!updatedWorkout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.json(updatedWorkout);
});

router.delete('/api/workouts/:id', async (request, response) => {
  validateId(request.params.id);
  const deletedWorkout = await workout.findByIdAndDelete(request.params.id);
  if (!deletedWorkout) {
    response.status(404).json({ error: 'Workout not found' });
    return;
  }
  response.status(204).end();
});

  return router;
}

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { Activity, Leaderboard, Team, User, Workout } from '../models/index.js';

async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();

    const userProfiles = [
      {
        username: 'alex_runner',
        email: 'alex@example.test',
        displayName: 'Alex Runner',
      },
      {
        username: 'sam_moves',
        email: 'sam@example.test',
        displayName: 'Sam Moves',
      },
    ];

    const users = await Promise.all(
      userProfiles.map((profile) =>
        User.findOneAndUpdate({ email: profile.email }, { $set: profile }, {
          upsert: true,
          new: true,
          runValidators: true,
        }),
      ),
    );

    const team = await Team.findOneAndUpdate(
      { name: 'OctoFit Pioneers' },
      {
        $set: {
          description: 'A team building healthy habits together.',
          members: users.map((user) => user._id),
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    const activities = [
      {
        user: users[0]._id,
        type: 'run',
        durationMinutes: 30,
        caloriesBurned: 280,
        loggedAt: new Date('2026-10-05T08:00:00.000Z'),
      },
      {
        user: users[1]._id,
        type: 'cycle',
        durationMinutes: 45,
        caloriesBurned: 350,
        loggedAt: new Date('2026-10-06T08:00:00.000Z'),
      },
    ];
    await Promise.all(
      activities.map(({ user, type, loggedAt, ...activity }) =>
        Activity.updateOne(
          { user, type, loggedAt },
          { $setOnInsert: { user, type, loggedAt, ...activity } },
          { upsert: true, runValidators: true },
        ),
      ),
    );

    await Promise.all(
      users.map((user, index) =>
        Leaderboard.findOneAndUpdate(
          { user: user._id, period: 'weekly' },
          {
            $set: {
              team: team._id,
              points: index === 0 ? 280 : 350,
            },
          },
          { upsert: true, new: true, runValidators: true },
        ),
      ),
    );

    const workouts = [
      {
        title: 'Easy 20-minute walk',
        description: 'A gentle walk to build a consistent cardio habit.',
        category: 'cardio',
        durationMinutes: 20,
        difficulty: 'beginner',
      },
      {
        title: 'Bodyweight strength circuit',
        description: 'A balanced full-body circuit with no equipment.',
        category: 'strength',
        durationMinutes: 30,
        difficulty: 'intermediate',
      },
    ];
    await Promise.all(
      workouts.map(({ title, ...workout }) =>
        Workout.updateOne(
          { title },
          { $set: { title, ...workout } },
          { upsert: true, runValidators: true },
        ),
      ),
    );

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();

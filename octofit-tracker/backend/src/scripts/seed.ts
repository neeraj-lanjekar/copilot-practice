import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import activity from '../models/Activity.js';
import leaderboard from '../models/Leaderboard.js';
import team from '../models/Team.js';
import user from '../models/User.js';
import workout from '../models/Workout.js';

async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Seed the octofit_db database with test data');

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
    const userEmails = userProfiles.map((profile) => profile.email);
    const workoutTitles = [
      'Easy 20-minute walk',
      'Bodyweight strength circuit',
    ];
    const existingUsers = await user
      .find({ email: { $in: userEmails } })
      .select('_id');

    await Promise.all([
      activity.deleteMany({ user: { $in: existingUsers.map(({ _id }) => _id) } }),
      leaderboard.deleteMany({
        user: { $in: existingUsers.map(({ _id }) => _id) },
      }),
      team.deleteMany({ name: 'OctoFit Pioneers' }),
      workout.deleteMany({ title: { $in: workoutTitles } }),
      user.deleteMany({ email: { $in: userEmails } }),
    ]);

    const users = await user.create(userProfiles);
    const [octofitTeam] = await team.create([
      {
        name: 'OctoFit Pioneers',
        description: 'A team building healthy habits together.',
        members: users.map(({ _id }) => _id),
      },
    ]);

    await activity.create([
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
    ]);

    await leaderboard.create([
      {
        user: users[0]._id,
        team: octofitTeam._id,
        period: 'weekly',
        points: 280,
      },
      {
        user: users[1]._id,
        team: octofitTeam._id,
        period: 'weekly',
        points: 350,
      },
    ]);

    await workout.create([
      {
        title: workoutTitles[0],
        description: 'A gentle walk to build a consistent cardio habit.',
        category: 'cardio',
        durationMinutes: 20,
        difficulty: 'beginner',
      },
      {
        title: workoutTitles[1],
        description: 'A balanced full-body circuit with no equipment.',
        category: 'strength',
        durationMinutes: 30,
        difficulty: 'intermediate',
      },
    ]);

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();

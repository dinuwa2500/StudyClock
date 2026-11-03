import { getDb } from './_lib/mongodb.ts';
import { getAuthUser, setCorsHeaders, checkRateLimit, parseRequestBody } from './_lib/auth.ts';

const DEFAULT_GOALS = {
  dailyHours: 3.5,
  weeklyHours: 20,
  monthlyHours: 85,
};

export default async function handler(req: any, res: any) {
  if (setCorsHeaders(req, res)) return;

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  if (!checkRateLimit(`goals-${authUser.userId}`, 60, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('goals');

    // GET /api/goals
    if (req.method === 'GET') {
      let goals = await collection.findOne({ userId: authUser.userId });
      if (!goals) {
        const initialGoals = {
          userId: authUser.userId,
          ...DEFAULT_GOALS,
          createdAt: Date.now(),
        };
        await collection.insertOne(initialGoals);
        goals = initialGoals as any;
      }

      return res.status(200).json({
        dailyHours: goals.dailyHours,
        weeklyHours: goals.weeklyHours,
        monthlyHours: goals.monthlyHours,
      });
    }

    const body = await parseRequestBody(req);

    // POST / PUT /api/goals
    if (req.method === 'POST' || req.method === 'PUT') {
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body.' });
      }

      const dailyHours = Math.max(0.5, Math.min(24, parseFloat(body.dailyHours) || 3.5));
      const weeklyHours = Math.max(1, Math.min(168, parseFloat(body.weeklyHours) || 20));
      const monthlyHours = Math.max(1, Math.min(744, parseFloat(body.monthlyHours) || 85));

      const updateData = {
        dailyHours,
        weeklyHours,
        monthlyHours,
        updatedAt: Date.now(),
      };

      await collection.updateOne(
        { userId: authUser.userId },
        { $set: updateData },
        { upsert: true }
      );

      return res.status(200).json({
        dailyHours,
        weeklyHours,
        monthlyHours,
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /api/goals internal error:', error);
    return res.status(500).json({ error: 'An unexpected server error occurred: ' + (error.message || 'Unknown') });
  }
}

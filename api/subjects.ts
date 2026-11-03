import { getDb } from './_lib/mongodb.ts';
import { getAuthUser, setCorsHeaders, checkRateLimit, parseRequestBody } from './_lib/auth.ts';

const DEFAULT_SUBJECTS_TEMPLATE = [
  { id: 'sub-math', name: 'Mathematics', color: '#3B82F6' },
  { id: 'sub-sci', name: 'Science', color: '#10B981' },
  { id: 'sub-eng', name: 'English', color: '#F59E0B' },
  { id: 'sub-ict', name: 'ICT', color: '#8B5CF6' },
  { id: 'sub-hist', name: 'History', color: '#EC4899' },
  { id: 'sub-other', name: 'Other', color: '#64748B' },
];

export default async function handler(req: any, res: any) {
  if (setCorsHeaders(req, res)) return;

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  if (!checkRateLimit(`subjects-${authUser.userId}`, 100, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('subjects');

    // GET /api/subjects
    if (req.method === 'GET') {
      let subjects = await collection.find({ userId: authUser.userId }).sort({ createdAt: 1 }).toArray();

      if (subjects.length === 0) {
        // Seed default subjects specifically for this user
        const initialUserSubjects = DEFAULT_SUBJECTS_TEMPLATE.map((s, idx) => ({
          ...s,
          id: `${s.id}-${authUser.userId.slice(-6)}`,
          userId: authUser.userId,
          createdAt: Date.now() + idx,
        }));

        await collection.insertMany(initialUserSubjects);
        subjects = await collection.find({ userId: authUser.userId }).sort({ createdAt: 1 }).toArray();
      }

      const mapped = subjects.map(({ _id, userId, ...rest }) => ({
        id: rest.id || _id.toString(),
        ...rest,
      }));
      return res.status(200).json(mapped);
    }

    const body = await parseRequestBody(req);

    // POST /api/subjects
    if (req.method === 'POST') {
      if (!body || typeof body !== 'object' || typeof body.name !== 'string' || !body.name.trim()) {
        return res.status(400).json({ error: 'Subject name is required.' });
      }

      const name = body.name.trim().slice(0, 50);
      const color = typeof body.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.color)
        ? body.color
        : '#8B5CF6';

      const newSubject = {
        id: typeof body.id === 'string' && body.id ? body.id.slice(0, 50) : `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: authUser.userId,
        name,
        color,
        createdAt: Date.now(),
      };

      await collection.insertOne(newSubject);
      const { _id, userId, ...clientSubject } = newSubject as any;
      return res.status(201).json(clientSubject);
    }

    // PUT /api/subjects
    if (req.method === 'PUT') {
      if (!body || typeof body !== 'object' || typeof body.id !== 'string' || !body.id.trim()) {
        return res.status(400).json({ error: 'Valid subject id is required.' });
      }

      const subjectId = body.id.trim();
      const updateDoc: Record<string, any> = {};

      if (typeof body.name === 'string' && body.name.trim()) {
        updateDoc.name = body.name.trim().slice(0, 50);
      }
      if (typeof body.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.color)) {
        updateDoc.color = body.color;
      }

      if (Object.keys(updateDoc).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
      }

      const result = await collection.updateOne(
        { id: subjectId, userId: authUser.userId },
        { $set: updateDoc }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Subject not found or not authorized.' });
      }

      return res.status(200).json({ success: true, id: subjectId, ...updateDoc });
    }

    // DELETE /api/subjects?id=...
    if (req.method === 'DELETE') {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const rawId = urlObj.searchParams.get('id') || body?.id;

      if (!rawId || typeof rawId !== 'string' || !rawId.trim()) {
        return res.status(400).json({ error: 'Valid subject id is required.' });
      }

      const subjectId = rawId.trim();

      const totalUserSubjects = await collection.countDocuments({ userId: authUser.userId });
      if (totalUserSubjects <= 1) {
        return res.status(400).json({ error: 'You must maintain at least one subject.' });
      }

      const result = await collection.deleteOne({ id: subjectId, userId: authUser.userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Subject not found or not authorized.' });
      }

      return res.status(200).json({ success: true, id: subjectId });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /api/subjects internal error:', error);
    return res.status(500).json({ error: 'An unexpected server error occurred: ' + (error.message || 'Unknown') });
  }
}

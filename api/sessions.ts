import { getDb } from './_lib/mongodb';
import { getAuthUser, setCorsHeaders, checkRateLimit } from './_lib/auth';

export default async function handler(req: any, res: any) {
  if (setCorsHeaders(req, res)) return;

  const authUser = getAuthUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required to access study sessions.' });
  }

  // Rate limiting per user
  if (!checkRateLimit(`sessions-${authUser.userId}`, 120, 60000)) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  try {
    const db = await getDb();
    const collection = db.collection('sessions');

    // GET /api/sessions -> Return only this user's sessions
    if (req.method === 'GET') {
      const sessions = await collection
        .find({ userId: authUser.userId })
        .sort({ startTime: -1 })
        .limit(1000)
        .toArray();

      const mapped = sessions.map(({ _id, userId, ...rest }) => ({
        id: rest.id || _id.toString(),
        ...rest,
      }));
      return res.status(200).json(mapped);
    }

    // POST /api/sessions -> Create session scoped to this user
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body.' });
      }

      // Input validation
      const durationSeconds = Math.max(1, Math.min(86400, parseInt(body.durationSeconds) || 0));
      const startTime = parseInt(body.startTime) || Date.now() - durationSeconds * 1000;
      const endTime = parseInt(body.endTime) || startTime + durationSeconds * 1000;
      const notes = typeof body.notes === 'string' ? body.notes.slice(0, 2000).trim() : '';
      const rating = Math.min(5, Math.max(1, parseInt(body.rating) || 5));
      const subjectId = typeof body.subjectId === 'string' ? body.subjectId.slice(0, 50) : 'sub-other';
      const subjectName = typeof body.subjectName === 'string' ? body.subjectName.slice(0, 100).trim() : 'Other';
      const subjectColor = typeof body.subjectColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.subjectColor)
        ? body.subjectColor
        : '#64748B';

      const sessionData = {
        id: typeof body.id === 'string' && body.id ? body.id.slice(0, 50) : `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: authUser.userId,
        subjectId,
        subjectName,
        subjectColor,
        startTime,
        endTime,
        durationSeconds,
        notes,
        rating,
        createdAt: Date.now(),
      };

      await collection.insertOne(sessionData);
      const { _id, userId, ...clientResponse } = sessionData as any;
      return res.status(201).json(clientResponse);
    }

    // PUT /api/sessions -> Update only this user's session with strict field whitelisting
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body || typeof body !== 'object' || typeof body.id !== 'string' || !body.id.trim()) {
        return res.status(400).json({ error: 'Valid session id is required.' });
      }

      const sessionId = body.id.trim();

      // Explicit whitelist of modifiable attributes
      const updateDoc: Record<string, any> = {};
      if (typeof body.notes === 'string') updateDoc.notes = body.notes.slice(0, 2000).trim();
      if (typeof body.rating === 'number') updateDoc.rating = Math.min(5, Math.max(1, body.rating));
      if (typeof body.durationSeconds === 'number') updateDoc.durationSeconds = Math.max(1, Math.min(86400, body.durationSeconds));
      if (typeof body.startTime === 'number') updateDoc.startTime = body.startTime;
      if (typeof body.endTime === 'number') updateDoc.endTime = body.endTime;
      if (typeof body.subjectId === 'string') updateDoc.subjectId = body.subjectId.slice(0, 50);
      if (typeof body.subjectName === 'string') updateDoc.subjectName = body.subjectName.slice(0, 100);
      if (typeof body.subjectColor === 'string' && /^#[0-9A-Fa-f]{6}$/.test(body.subjectColor)) updateDoc.subjectColor = body.subjectColor;

      const result = await collection.updateOne(
        { id: sessionId, userId: authUser.userId },
        { $set: updateDoc }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Session not found or not authorized.' });
      }

      return res.status(200).json({ success: true, id: sessionId, ...updateDoc });
    }

    // DELETE /api/sessions?id=... -> Delete only this user's session
    if (req.method === 'DELETE') {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const rawId = urlObj.searchParams.get('id') || (typeof req.body === 'object' ? req.body?.id : null);

      if (!rawId || typeof rawId !== 'string' || !rawId.trim()) {
        return res.status(400).json({ error: 'Valid session id is required.' });
      }

      const sessionId = rawId.trim();
      const result = await collection.deleteOne({ id: sessionId, userId: authUser.userId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Session not found or not authorized.' });
      }

      return res.status(200).json({ success: true, id: sessionId });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API /api/sessions internal error:', error);
    return res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}

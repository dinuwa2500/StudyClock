import { getDb } from './_lib/mongodb.ts';
import {
  hashPassword,
  verifyPassword,
  createToken,
  getAuthUser,
  setCorsHeaders,
  checkRateLimit,
  parseRequestBody,
  getActionParam,
} from './_lib/auth.ts';

export default async function handler(req: any, res: any) {
  if (setCorsHeaders(req, res)) return;

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  if (!checkRateLimit(`auth-${clientIp}`, 60, 60000)) {
    return res.status(429).json({ error: 'Too many authentication attempts. Please try again in a minute.' });
  }

  try {
    const body = await parseRequestBody(req);
    const action = getActionParam(req, body);

    // GET /api/auth?action=me
    if (req.method === 'GET') {
      const authUser = getAuthUser(req);
      if (!authUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      return res.status(200).json({ user: authUser });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    // 1. ANONYMOUS GUEST REGISTRATION
    if (action === 'anonymous') {
      const guestId = `user-guest-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const guestName = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;

      const userRecord = {
        userId: guestId,
        username: guestName.toLowerCase(),
        displayName: guestName,
        isAnonymous: true,
        createdAt: Date.now(),
      };

      await usersCollection.insertOne(userRecord);
      const token = createToken({ userId: guestId, username: guestName });

      return res.status(201).json({
        token,
        user: { userId: guestId, username: guestName, displayName: guestName, isAnonymous: true },
      });
    }

    // 2. REGISTER
    if (action === 'register') {
      const username = body?.username;
      const password = body?.password;

      if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
        return res.status(400).json({ error: 'Username must be between 3 and 30 characters.' });
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens and underscores.' });
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const existing = await usersCollection.findOne({ username: cleanUsername });

      if (existing) {
        return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
      }

      // Check if user is upgrading an existing anonymous session
      const existingAuth = getAuthUser(req);
      const userId = existingAuth?.userId || `user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const hashedPassword = hashPassword(password);
      const newUser = {
        userId,
        username: cleanUsername,
        displayName: username.trim(),
        password: hashedPassword,
        isAnonymous: false,
        createdAt: Date.now(),
      };

      if (existingAuth?.userId) {
        await usersCollection.updateOne(
          { userId: existingAuth.userId },
          { $set: newUser },
          { upsert: true }
        );
      } else {
        await usersCollection.insertOne(newUser);
      }

      const token = createToken({ userId, username: cleanUsername });
      return res.status(201).json({
        token,
        user: { userId, username: cleanUsername, displayName: username.trim() },
      });
    }

    // 3. LOGIN
    if (action === 'login') {
      const username = body?.username;
      const password = body?.password;

      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = await usersCollection.findOne({ username: cleanUsername });

      if (!user || !user.password) {
        verifyPassword('dummy', 'salt:0000000000000000000000000000000000000000000000000000000000000000');
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const isValid = verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      const token = createToken({ userId: user.userId, username: user.username });
      return res.status(200).json({
        token,
        user: { userId: user.userId, username: user.username, displayName: user.displayName || user.username },
      });
    }

    return res.status(400).json({ error: 'Invalid action requested.' });
  } catch (error: any) {
    console.error('Authentication Error:', error);
    return res.status(500).json({ error: 'Database or server connection failure: ' + (error.message || 'Unknown') });
  }
}

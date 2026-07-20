import { Redis } from '@upstash/redis';
import jwt from 'jsonwebtoken';

const redis = Redis.fromEnv();
const SECRET = process.env.JWT_SECRET || 'doorlux_secret_key_change_me';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    const rawUser = await redis.get(`user:${decoded.email.toLowerCase()}`);
    if (!rawUser) return res.status(404).json({ error: 'Пользователь не найден' });

    const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
    res.status(200).json({ user: { name: user.name, email: user.email, joined: user.joined } });
  } catch (err) {
    res.status(401).json({ error: 'Токен недействителен' });
  }
}

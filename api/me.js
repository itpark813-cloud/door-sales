import { kv } from '@vercel/kv';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'doorlux_secret_key_change_me';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = await kv.get(`user:${decoded.email.toLowerCase()}`);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    res.status(200).json({ user: { name: user.name, email: user.email, joined: user.joined } });
  } catch (err) {
    res.status(401).json({ error: 'Токен недействителен' });
  }
}

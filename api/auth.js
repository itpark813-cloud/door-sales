import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'doorlux_secret_key_change_me';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните email и пароль' });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: 'Пароль слишком короткий (мин. 4 символа)' });
  }

  const userKey = `user:${email.toLowerCase()}`;
  const existingUser = await kv.get(userKey);

  if (existingUser) {
    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    const token = jwt.sign({ email: existingUser.email }, SECRET, { expiresIn: '7d' });
    return res.status(200).json({
      token,
      user: { name: existingUser.name, email: existingUser.email, joined: existingUser.joined }
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    name: email.split('@')[0],
    email: email.toLowerCase(),
    password: hashedPassword,
    joined: new Date().toLocaleDateString('ru-RU')
  };

  await kv.set(userKey, newUser);

  const token = jwt.sign({ email: newUser.email }, SECRET, { expiresIn: '7d' });
  return res.status(201).json({
    token,
    user: { name: newUser.name, email: newUser.email, joined: newUser.joined }
  });
}

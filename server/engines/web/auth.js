import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function signUser(user) { return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '8h' }); }
export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  try { req.user = jwt.verify(token, env.jwtSecret); return next(); }
  catch { return res.status(401).json({ success: false, error: 'Invalid or expired token' }); }
}
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, error: 'Administrator access required' });
  return next();
}

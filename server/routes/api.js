import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Resource } from '../models/Resource.js';
import { signUser, requireAuth, requireAdmin } from '../engines/web/auth.js';
import { ok, fail } from '../engines/web/ApiResponse.js';

const resourceInput = z.object({
  title: z.string().min(1).max(200), description: z.string().min(1),
  category: z.enum(['notice', 'placement', 'event', 'faculty', 'academic']),
  resourceType: z.string().optional(), department: z.string().optional(),
  semester: z.number().int().min(1).max(12).optional(), academicYear: z.string().optional(),
  tags: z.array(z.string()).default([]), metadata: z.record(z.any()).default({})
});

export function apiRouter(searchEngine) {
  const router = Router();
  router.post('/auth/login', async (req, res, next) => {
    try {
      const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = typeof req.body.password === 'string' ? req.body.password : '';
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) return fail(res, 'Invalid credentials', 401);
      return ok(res, { token: signUser(user), user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) { return next(error); }
  });
  router.get('/search', async (req, res) => {
    const { q = '', ...filters } = req.query;
    const results = searchEngine.search(q, filters);
    return ok(res, { count: results.length, results });
  });
  router.get('/suggest', (req, res) => ok(res, searchEngine.suggest(req.query.q || '', Number(req.query.limit || 8))));
  router.get('/resources/:id', async (req, res, next) => {
    try { const resource = await Resource.findById(req.params.id); return resource ? ok(res, resource) : fail(res, 'Resource not found', 404); }
    catch (error) { return next(error); }
  });
  router.get('/resources', async (req, res, next) => {
    try {
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      const resources = await Resource.find(filter).sort({ publishedAt: -1 }).limit(50).lean();
      return ok(res, resources);
    } catch (error) { return next(error); }
  });
  router.get('/admin/me', requireAuth, requireAdmin, (req, res) => ok(res, { authenticated: true, role: req.user.role }));
  router.get('/admin/dashboard', requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const categories = ['notice', 'placement', 'event', 'faculty', 'academic'];
      const counts = await Promise.all(categories.map((category) => Resource.countDocuments({ category })));
      return ok(res, {
        totalResources: counts.reduce((total, count) => total + count, 0),
        notices: counts[0],
        placements: counts[1],
        events: counts[2],
        faculty: counts[3],
        academicResources: counts[4]
      });
    } catch (error) { return next(error); }
  });
  router.post('/resources', requireAuth, requireAdmin, async (req, res, next) => {
    try {
      const input = resourceInput.parse(req.body);
      const resource = await Resource.create({ ...input, createdBy: req.user.sub });
      searchEngine.add(resource.toObject());
      return ok(res, resource, 201);
    } catch (error) { return error.name === 'ZodError' ? fail(res, error.issues[0].message) : next(error); }
  });
  return router;
}

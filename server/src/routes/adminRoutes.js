import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loginLimiter, writeLimiter } from '../middleware/rateLimits.js';
import { handleUploadErrors, upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  contactPayload,
  experiencePayload,
  experienceUpdatePayload,
  idParam,
  loginPayload,
  messageListQuery,
  messageUpdatePayload,
  postPayload,
  postUpdatePayload,
  projectListQuery,
  projectPayload,
  projectStatusPayload,
  projectUpdatePayload,
  settingsPayload,
  skillPayload,
  skillUpdatePayload,
  uploadKindPayload
} from '../schemas/index.js';
import * as auth from '../controllers/authController.js';
import * as dashboard from '../controllers/dashboardController.js';
import * as projects from '../controllers/projectController.js';
import * as skills from '../controllers/skillController.js';
import * as experience from '../controllers/experienceController.js';
import * as blog from '../controllers/blogController.js';
import * as messages from '../controllers/messageController.js';
import * as settings from '../controllers/settingsController.js';
import * as uploads from '../controllers/uploadController.js';

const router = Router();

/* Publicly reachable pieces of the admin API: sign-in and sign-out only. */
router.post('/login', loginLimiter, validate({ body: loginPayload }), auth.login);
router.post('/logout', auth.logout);

/* ------------------------- everything below is protected ------------------ */
router.use(requireAuth);

router.get('/me', auth.me);
router.get('/stats', dashboard.stats);

/* Projects */
router.get('/projects', validate({ query: projectListQuery }), projects.listAdmin);
router.post('/projects', validate({ body: projectPayload }), projects.create);
router.get('/projects/:id', validate({ params: idParam }), projects.getAdminOne);
router.put(
  '/projects/:id',
  validate({ params: idParam, body: projectUpdatePayload }),
  projects.update
);
router.patch(
  '/projects/:id',
  validate({ params: idParam, body: projectStatusPayload }),
  projects.patch
);
router.delete('/projects/:id', validate({ params: idParam }), projects.remove);

/* Skills */
router.get('/skills', skills.listAdmin);
router.post('/skills', validate({ body: skillPayload }), skills.create);
router.put('/skills/:id', validate({ params: idParam, body: skillUpdatePayload }), skills.update);
router.delete('/skills/:id', validate({ params: idParam }), skills.remove);

/* Experience & education */
router.get('/experience', experience.listAdmin);
router.post('/experience', validate({ body: experiencePayload }), experience.create);
router.put(
  '/experience/:id',
  validate({ params: idParam, body: experienceUpdatePayload }),
  experience.update
);
router.delete('/experience/:id', validate({ params: idParam }), experience.remove);

/* Blog */
router.get('/blog', blog.listAdmin);
router.post('/blog', validate({ body: postPayload }), blog.create);
router.get('/blog/:id', validate({ params: idParam }), blog.getAdminOne);
router.put('/blog/:id', validate({ params: idParam, body: postUpdatePayload }), blog.update);
router.delete('/blog/:id', validate({ params: idParam }), blog.remove);

/* Contact inbox */
router.get('/messages', validate({ query: messageListQuery }), messages.listAdmin);
router.get('/messages/:id', validate({ params: idParam }), messages.getAdminOne);
router.patch('/messages/:id', validate({ params: idParam, body: messageUpdatePayload }), messages.patch);
router.delete('/messages/:id', validate({ params: idParam }), messages.remove);

/* Site settings */
router.put('/settings', validate({ body: settingsPayload }), settings.update);

/* Uploads */
router.post(
  '/uploads',
  writeLimiter,
  upload.single('file'),
  handleUploadErrors,
  validate({ body: uploadKindPayload }),
  uploads.uploadAsset
);

export default router;

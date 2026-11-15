import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { contactLimiter } from '../middleware/rateLimits.js';
import {
  contactPayload,
  postListQuery,
  projectListQuery,
  slugParam
} from '../schemas/index.js';
import * as projects from '../controllers/projectController.js';
import * as skills from '../controllers/skillController.js';
import * as experience from '../controllers/experienceController.js';
import * as blog from '../controllers/blogController.js';
import * as messages from '../controllers/messageController.js';
import * as settings from '../controllers/settingsController.js';

const router = Router();

router.get('/projects', validate({ query: projectListQuery }), projects.listPublic);
router.get('/projects/:slug', validate({ params: slugParam }), projects.getPublicOne);

router.get('/skills', skills.list);
router.get('/experience', experience.list);

router.get('/blog/categories', blog.publicCategories);
router.get('/blog', validate({ query: postListQuery }), blog.listPublic);
router.get('/blog/:slug', validate({ params: slugParam }), blog.getPublicOne);

router.get('/settings', settings.getPublic);

router.post('/contact', contactLimiter, validate({ body: contactPayload }), messages.submit);

export default router;

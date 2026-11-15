import Project from '../models/Project.js';
import Post from '../models/Post.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import Message from '../models/Message.js';
import { asyncHandler } from '../utils/http.js';

/** GET /api/admin/stats */
export const stats = asyncHandler(async (_req, res) => {
  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    totalMessages,
    unreadMessages,
    totalPosts,
    publishedPosts
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: 'published' }),
    Project.countDocuments({ status: 'draft' }),
    Message.countDocuments(),
    Message.countDocuments({ status: 'unread' }),
    Post.countDocuments(),
    Post.countDocuments({ status: 'published' })
  ]);

  const [recentMessages, recentProjects, skillCount, experienceCount] = await Promise.all([
    Message.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject status createdAt'),
    Project.find().sort({ updatedAt: -1 }).limit(5).select('title slug status updatedAt'),
    Skill.countDocuments(),
    Experience.countDocuments()
  ]);

  res.json({
    stats: {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalMessages,
      unreadMessages,
      totalPosts,
      publishedPosts,
      skillCount,
      experienceCount
    },
    recentMessages,
    recentProjects
  });
});

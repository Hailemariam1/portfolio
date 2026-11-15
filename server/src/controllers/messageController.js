import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import { ApiError, asyncHandler } from '../utils/http.js';
import { escapeRegex, paginationMeta, parsePagination } from '../utils/pagination.js';
import { sendContactNotification } from '../utils/mailer.js';

/** POST /api/contact */
export const submit = asyncHandler(async (req, res) => {
  const { name, email, subject, message, website } = req.body;

  // Honeypot: bots fill the hidden field, humans never see it.
  if (website) {
    return res.status(201).json({ success: true, message: 'Thanks for reaching out.' });
  }

  const settings = await Settings.getSite();
  const saved = await Message.create({
    name,
    email,
    subject,
    message,
    meta: {
      ip: req.ip || '',
      userAgent: String(req.headers['user-agent'] || '').slice(0, 300)
    }
  });

  const delivered = await sendContactNotification({ message: saved, settings });
  if (delivered) {
    saved.emailSent = true;
    await saved.save();
  }

  res.status(201).json({
    success: true,
    message: "Thanks for reaching out — your message has been sent. I'll reply by email.",
    emailSent: delivered
  });
});

/** GET /api/admin/messages */
export const listAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 20 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
  }

  const [items, total, unread] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
    Message.countDocuments({ status: 'unread' })
  ]);

  res.json({
    items,
    unread,
    pagination: paginationMeta({ page, limit, total })
  });
});

/** GET /api/admin/messages/:id — opening an unread message marks it read. */
export const getAdminOne = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) throw ApiError.notFound('Message not found.');

  if (message.status === 'unread') {
    message.status = 'read';
    message.readAt = new Date();
    await message.save();
  }

  res.json({ message });
});

/** PATCH /api/admin/messages/:id */
export const patch = asyncHandler(async (req, res) => {
  const update = { status: req.body.status };
  if (req.body.status === 'read') update.readAt = new Date();
  if (req.body.status === 'unread') update.readAt = null;

  const message = await Message.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!message) throw ApiError.notFound('Message not found.');
  res.json({ message });
});

/** DELETE /api/admin/messages/:id */
export const remove = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw ApiError.notFound('Message not found.');
  res.json({ success: true, id: req.params.id });
});

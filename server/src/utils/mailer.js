import nodemailer from 'nodemailer';
import env from '../config/env.js';

let transporter;
let transportChecked = false;

function getTransport() {
  if (transportChecked) return transporter;
  transportChecked = true;
  if (!env.mail.host) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    disableFileAccess: true,
    disableUrlAccess: true,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined
  });
  return transporter;
}

export function mailConfigured() {
  return Boolean(env.mail.host);
}

export async function sendTestContactNotification({ settings }) {
  const transport = getTransport();
  const recipient = env.mail.to || settings?.email;
  if (!transport) return { sent: false, error: 'SMTP is not configured.' };
  if (!recipient) return { sent: false, error: 'No notification recipient is configured.' };

  try {
    await transport.sendMail({
      from: env.mail.from,
      to: recipient,
      subject: 'Portfolio email delivery test',
      text: 'This is a test email from your portfolio contact form.',
      html: '<p>This is a test email from your portfolio contact form.</p>'
    });
    return { sent: true, recipient };
  } catch (error) {
    console.warn('[mail] test email failed:', error.message);
    return { sent: false, error: error.message };
  }
}

/**
 * Notify the portfolio owner about a new contact message. Never throws: a mail
 * outage must not lose a message that is already stored in MongoDB.
 */
export async function sendContactNotification({ message, settings }) {
  const transport = getTransport();
  const recipient = env.mail.to || settings?.email;
  if (!transport || !recipient) {
    console.info('[mail] SMTP not configured — message saved without an email notification.');
    return false;
  }

  try {
    await transport.sendMail({
      from: env.mail.from,
      to: recipient,
      replyTo: message.email,
      subject: `Portfolio contact: ${message.subject || 'New message'}`,
      text: [
        `Name: ${message.name}`,
        `Email: ${message.email}`,
        `Subject: ${message.subject || '(none)'}`,
        `Received: ${new Date(message.createdAt).toUTCString()}`,
        '',
        message.message
      ].join('\n'),
      html: `
        <h2 style="font-family:system-ui,sans-serif">New portfolio message</h2>
        <p><strong>Name:</strong> ${escapeHtml(message.name)}<br />
        <strong>Email:</strong> ${escapeHtml(message.email)}<br />
        <strong>Subject:</strong> ${escapeHtml(message.subject || '(none)')}</p>
        <p style="white-space:pre-wrap;font-family:system-ui,sans-serif">${escapeHtml(message.message)}</p>
      `
    });
    return true;
  } catch (error) {
    console.warn('[mail] failed to send contact notification:', error.message);
    return false;
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

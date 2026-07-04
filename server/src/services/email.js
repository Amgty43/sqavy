import nodemailer from 'nodemailer';

let transporter = null;
let warned = false;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    if (!warned) {
      console.warn('[email] SMTP env vars not set — skipping email reminders.');
      warned = true;
    }
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendDigestEmail(user, { overdue, dueToday }) {
  const client = getTransporter();
  if (!client) return false;

  const listItem = (a) => `<li>${a.title}${a.subjectName ? ` — <em>${a.subjectName}</em>` : ''}</li>`;
  const overdueHtml = overdue.length
    ? `<h3>Overdue</h3><ul>${overdue.map(listItem).join('')}</ul>`
    : '';
  const dueTodayHtml = dueToday.length
    ? `<h3>Due today</h3><ul>${dueToday.map(listItem).join('')}</ul>`
    : '';

  await client.sendMail({
    from: process.env.EMAIL_FROM || 'Homeroom <reminders@example.com>',
    to: user.email,
    subject: `Homeroom: ${dueToday.length + overdue.length} assignment(s) need attention today`,
    html: `<p>Morning, ${user.name}!</p>${overdueHtml}${dueTodayHtml}<p>Open Homeroom to check them off.</p>`,
  });
  return true;
}

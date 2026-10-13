// Email messages (PLAN.md 4.4, 4.5, 4.10). Plain words, one button, an unfollow link in every email.
import { BRAND, esc } from "./render";

export interface OutgoingEmail {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  headers: Record<string, string>;
}

// The part of Cloudflare Email Service's `send_email` binding we use.
export interface Mailer {
  send(message: { to: string; from: string; subject: string; text: string; html: string; headers?: Record<string, string> }): Promise<unknown>;
}

function shell(title: string, lines: string[], button: { href: string; label: string }, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f4ef;font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;color:#15171c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border:1px solid #eeece6;border-radius:20px" cellpadding="0" cellspacing="0"><tr><td style="padding:24px">
<p style="margin:0 0 16px;font-weight:700">${BRAND}</p>
<h1 style="margin:0 0 12px;font-size:20px;line-height:26px">${esc(title)}</h1>
${lines.map((l) => `<p style="margin:0 0 12px;font-size:15px;line-height:22px">${esc(l)}</p>`).join("")}
<p style="margin:20px 0"><a href="${esc(button.href)}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:600;border-radius:999px;padding:12px 20px">${esc(button.label)}</a></p>
<p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#565b66">${footer}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function confirmEmail(p: {
  to: string;
  from: string;
  projectName: string;
  confirmUrl: string;
  manageUrl: string;
}): OutgoingEmail {
  const subject = `Confirm: follow ${p.projectName}`;
  const lines = [
    `Someone, probably you, asked to follow ${p.projectName} on ${BRAND}.`,
    "Press the button to confirm. Nothing starts until you do. The link works for 7 days.",
    "We send one email when the record changes and one email each quarter. Nothing else.",
  ];
  const ignore = "If you did not ask for this, ignore this email and nothing happens.";
  return {
    to: p.to,
    from: p.from,
    subject,
    text: `${lines.join("\n\n")}\n\nConfirm: ${p.confirmUrl}\n\n${ignore}\nManage your follows: ${p.manageUrl}\n`,
    html: shell(subject, lines, { href: p.confirmUrl, label: "Confirm and follow" }, `${esc(ignore)} <a href="${esc(p.manageUrl)}" style="color:#565b66">Manage your follows</a>.`),
    headers: {},
  };
}

// Change and quarterly emails share this frame. List-Unsubscribe makes unfollow one click
// in mail apps that support RFC 8058.
export function followerEmail(p: {
  to: string;
  from: string;
  subject: string;
  title: string;
  lines: string[];
  pageUrl: string;
  unfollowUrl: string;
  manageUrl: string;
}): OutgoingEmail {
  return {
    to: p.to,
    from: p.from,
    subject: p.subject,
    text: `${p.lines.join("\n\n")}\n\nOpen the project: ${p.pageUrl}\n\nUnfollow this project: ${p.unfollowUrl}\nManage your follows: ${p.manageUrl}\n`,
    html: shell(
      p.title,
      p.lines,
      { href: p.pageUrl, label: "Open the project" },
      `<a href="${esc(p.unfollowUrl)}" style="color:#565b66">Unfollow this project</a> · <a href="${esc(p.manageUrl)}" style="color:#565b66">Manage your follows</a>`,
    ),
    headers: {
      "List-Unsubscribe": `<${p.unfollowUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

// Follow by email with double opt-in (PLAN.md 4.4 and 4.10). No account, no password.
import { decrypt, encrypt, hmac, newId, randomToken, sha256, signToken, verifyToken } from "./crypto";
import { confirmEmail, type Mailer } from "./email";
import * as store from "./store";
import type { D1Like, ProjectRow } from "./store";

export const CONFIRM_TTL_SEC = 7 * 24 * 3600;
export const FOLLOW_LIMIT_PER_HOUR = 5;
export const CONFIRM_MAILS_PER_DAY = 3;

export interface Deps {
  db: D1Like;
  mailer: Mailer;
  secret: string;
  from: string;
  origin: string;
  now: () => number; // unix seconds
}

export function normaliseEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email)) return null;
  return email;
}

const emailHash = (d: Deps, email: string) => hmac(d.secret, `email:${email}`);

export const manageUrl = async (d: Deps, followerId: string) => `${d.origin}/follows/${await signToken(d.secret, "manage", followerId)}`;
export const unfollowUrl = async (d: Deps, followId: string) => `${d.origin}/u/${await signToken(d.secret, "unfollow", followId)}`;

export type FollowRequestResult = "sent" | "invalid" | "limited";

// Always answers "sent" for a valid address, whether or not it already follows,
// so the form cannot be used to learn who follows what.
export async function requestFollow(d: Deps, project: ProjectRow, rawEmail: string, clientKey: string): Promise<FollowRequestResult> {
  const email = normaliseEmail(rawEmail);
  if (!email) return "invalid";
  const now = d.now();
  if (!(await store.rateLimit(d.db, "follow", await sha256(`${d.secret}:${clientKey}`), FOLLOW_LIMIT_PER_HOUR, 3600, now))) return "limited";

  const hash = await emailHash(d, email);
  let follower = await store.followerByHash(d.db, hash);
  if (!follower) {
    const id = newId();
    await store.insertFollower(d.db, id, hash, await encrypt(d.secret, email), now);
    follower = { id, email_enc: "" };
  }
  const existing = await store.followFor(d.db, follower.id, project.id);
  if (existing?.state === "active") return "sent";
  if (!(await store.rateLimit(d.db, "confirm-mail", hash, CONFIRM_MAILS_PER_DAY, 86400, now))) return "sent";

  const token = randomToken();
  const followId = existing?.id ?? newId();
  await store.upsertPendingFollow(d.db, followId, follower.id, project.id, await sha256(token), now);
  const msg = confirmEmail({
    to: email,
    from: d.from,
    projectName: project.name,
    confirmUrl: `${d.origin}/follow/confirm?t=${token}`,
    manageUrl: await manageUrl(d, follower.id),
  });
  let status = "sent";
  try {
    await d.mailer.send(msg);
  } catch {
    status = "failed";
  }
  await store.logEmail(d.db, newId(), followId, "confirm", now, status);
  return "sent";
}

export type ConfirmResult =
  | { kind: "followed"; project: ProjectRow }
  | { kind: "expired" | "invalid" };

export async function confirmFollow(d: Deps, token: string): Promise<ConfirmResult> {
  if (!token) return { kind: "invalid" };
  const follow = await store.followByConfirmHash(d.db, await sha256(token));
  if (!follow || follow.state !== "pending") return { kind: "invalid" };
  if (d.now() - follow.created_at > CONFIRM_TTL_SEC) return { kind: "expired" };
  await store.activateFollow(d.db, follow.id, d.now());
  const project = await store.projectById(d.db, follow.project);
  return project ? { kind: "followed", project } : { kind: "invalid" };
}

export async function unfollowByToken(d: Deps, token: string): Promise<ProjectRow | null> {
  const followId = await verifyToken(d.secret, "unfollow", token);
  if (!followId) return null;
  const follow = await store.followById(d.db, followId);
  if (!follow) return null;
  await store.setFollowState(d.db, follow.id, "unfollowed");
  return store.projectById(d.db, follow.project);
}

export async function followerFromManageToken(d: Deps, token: string): Promise<string | null> {
  const id = await verifyToken(d.secret, "manage", token);
  if (!id) return null;
  return (await store.followerById(d.db, id))?.id ?? null;
}

export async function unfollowFromManage(d: Deps, followerId: string, followId: string): Promise<boolean> {
  const follow = await store.followById(d.db, followId);
  if (!follow || follow.follower !== followerId) return false;
  await store.setFollowState(d.db, follow.id, "unfollowed");
  return true;
}

export async function followerEmail(d: Deps, followerId: string): Promise<string | null> {
  const row = await store.followerById(d.db, followerId);
  return row ? decrypt(d.secret, row.email_enc) : null;
}

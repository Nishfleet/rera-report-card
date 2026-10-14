import type { Grade } from "../grade";
import type { ProjectStatus, StateCode } from "../ingest/types";

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

export interface ProjectRow {
  id: string;
  state: StateCode;
  regno: string;
  slug: string;
  name: string;
  promoter: string;
  district: string;
  locality: string;
  status: ProjectStatus;
  source_url: string;
  source_name: string;
  last_read_at: number | null;
}

export interface GradeRow {
  grade: Grade;
  filingsRead: number;
  computedAt: number;
}

export interface FollowRow {
  id: string;
  follower: string;
  project: string;
  state: "pending" | "active" | "unfollowed";
  created_at: number;
  confirmed_at: number | null;
}

export function slugOf(regno: string): string {
  return regno
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function projectBySlug(db: D1Like, state: string, slug: string): Promise<ProjectRow | null> {
  return db.prepare("SELECT * FROM project WHERE state = ? AND slug = ?").bind(state, slug).first<ProjectRow>();
}

export async function projectById(db: D1Like, id: string): Promise<ProjectRow | null> {
  return db.prepare("SELECT * FROM project WHERE id = ?").bind(id).first<ProjectRow>();
}

export async function latestGrade(db: D1Like, projectId: string): Promise<GradeRow | null> {
  const row = await db
    .prepare("SELECT grade_json, filings_read, computed_at FROM grade WHERE project = ? ORDER BY computed_at DESC LIMIT 1")
    .bind(projectId)
    .first<{ grade_json: string; filings_read: number; computed_at: number }>();
  if (!row) return null;
  return { grade: JSON.parse(row.grade_json) as Grade, filingsRead: row.filings_read, computedAt: row.computed_at };
}

export async function followerByHash(db: D1Like, emailHash: string) {
  return db.prepare("SELECT id, email_enc FROM follower WHERE email_hash = ?").bind(emailHash).first<{ id: string; email_enc: string }>();
}

export async function followerById(db: D1Like, id: string) {
  return db.prepare("SELECT id, email_enc FROM follower WHERE id = ?").bind(id).first<{ id: string; email_enc: string }>();
}

export async function insertFollower(db: D1Like, id: string, emailHash: string, emailEnc: string, now: number) {
  await db
    .prepare("INSERT INTO follower (id, email_hash, email_enc, consent_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(id, emailHash, emailEnc, now, now)
    .run();
}

export async function followFor(db: D1Like, followerId: string, projectId: string): Promise<FollowRow | null> {
  return db.prepare("SELECT * FROM follow WHERE follower = ? AND project = ?").bind(followerId, projectId).first<FollowRow>();
}

export async function followById(db: D1Like, id: string): Promise<FollowRow | null> {
  return db.prepare("SELECT * FROM follow WHERE id = ?").bind(id).first<FollowRow>();
}

export async function followByConfirmHash(db: D1Like, hash: string): Promise<FollowRow | null> {
  return db.prepare("SELECT * FROM follow WHERE confirm_token_hash = ?").bind(hash).first<FollowRow>();
}

export async function upsertPendingFollow(db: D1Like, id: string, followerId: string, projectId: string, tokenHash: string, now: number) {
  await db
    .prepare(
      `INSERT INTO follow (id, follower, project, state, confirm_token_hash, created_at)
       VALUES (?, ?, ?, 'pending', ?, ?)
       ON CONFLICT (follower, project) DO UPDATE SET
         state = 'pending', confirm_token_hash = excluded.confirm_token_hash,
         created_at = excluded.created_at, confirmed_at = NULL`,
    )
    .bind(id, followerId, projectId, tokenHash, now)
    .run();
}

export async function activateFollow(db: D1Like, id: string, now: number) {
  await db.prepare("UPDATE follow SET state = 'active', confirmed_at = ?, confirm_token_hash = NULL WHERE id = ?").bind(now, id).run();
}

export async function setFollowState(db: D1Like, id: string, state: FollowRow["state"]) {
  await db.prepare("UPDATE follow SET state = ?, confirm_token_hash = NULL WHERE id = ?").bind(state, id).run();
}

export async function activeFollowsOf(db: D1Like, followerId: string) {
  const { results } = await db
    .prepare(
      `SELECT follow.id AS follow_id, project.state, project.slug, project.name
       FROM follow JOIN project ON project.id = follow.project
       WHERE follow.follower = ? AND follow.state = 'active' ORDER BY project.name`,
    )
    .bind(followerId)
    .all<{ follow_id: string; state: string; slug: string; name: string }>();
  return results;
}

export async function deleteFollower(db: D1Like, followerId: string) {
  await db.prepare("DELETE FROM follow WHERE follower = ?").bind(followerId).run();
  await db.prepare("DELETE FROM follower WHERE id = ?").bind(followerId).run();
}

export async function logEmail(db: D1Like, id: string, followId: string | null, template: string, now: number, status: string) {
  await db
    .prepare("INSERT INTO email_send (id, follow, template, sent_at, status) VALUES (?, ?, ?, ?, ?)")
    .bind(id, followId, template, now, status)
    .run();
}

export async function rateLimit(db: D1Like, bucket: string, keyHash: string, limit: number, windowSec: number, now: number) {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM rate_hit WHERE bucket = ? AND key_hash = ? AND at > ?")
    .bind(bucket, keyHash, now - windowSec)
    .first<{ n: number }>();
  if ((row?.n ?? 0) >= limit) return false;
  await db.prepare("INSERT INTO rate_hit (bucket, key_hash, at) VALUES (?, ?, ?)").bind(bucket, keyHash, now).run();
  return true;
}
